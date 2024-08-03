const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, Partials, EmbedBuilder } = require('discord.js');
const { token, webhook_whitelist } = require('./config.json');
const { send_log } = require('./utils.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.User
    ],
});



client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

client.on('guildAuditLogEntryCreate', async (entry) => {
    const { action, executor, target, reason } = entry;
    const guild = entry.guild;
    send_log("Audit Log Entry", `Action: ${action}\nExecutor: ${executor.tag}\nTarget: ${target.tag || target.id}\nReason: ${reason || 'None'}`, guild);
});


client.on("webhooksUpdate", async (channel) => {
    try {
        const webhooks = await channel.fetchWebhooks();
        const list = {};

        webhooks.forEach(webhook => {
            const ownerId = webhook.owner.id.toString();
            list[ownerId] = (list[ownerId] || 0) + 1;
        });

        for (const [ownerID, times] of Object.entries(list)) {
            const guild = channel.guild;

            if (!webhook_whitelist.includes(ownerID)) {
                try {
                    const member = await guild.members.fetch(ownerID);
                    if (member) {
                        await member.kick(`User not whitelisted to create webhooks`);
                        send_log("Disallowed Webhook Creation", `${member.user.tag} was kicked for trying to create a webhook`, guild);

                        try {
                            await member.send(`You've been kicked for: disallowed webhook creation`);
                        } catch (e) {
                            console.error(`Failed to send DM to ${member.user.tag}: ${e}`);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch member ${ownerID}: ${e}`);
                }

                return; 
            }

            if (times > 1) {
                try {
                    const member = await guild.members.fetch(ownerID);
                    if (member) {
                        await member.kick(`Created more than one webhook (${times} webhooks)`);
                        send_log("Webhook spam", `${member.user.tag} was kicked for webhook spam`, guild);
                        console.log(`Kicked user ${member.user.tag} for creating ${times} webhooks.`);

                        try {
                            await member.send(`You've been kicked for: webhook spam`);
                        } catch (e) {
                            console.error(`Failed to send DM to ${member.user.tag}: ${e}`);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch member ${ownerID}: ${e}`);
                }
            }
        }

        console.log(list);
    } catch (error) {
        console.error(`Error in webhooksUpdate handler: ${error}`);
    }
});




client.once(Events.ClientReady, () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);

    // setInterval(async () => {
    //     const guild = await client.guilds.fetch(guildId);
    //     const currentVanityURL = await guild.fetchVanityData();
        
    //     if (currentVanityURL.code !== storedVanityURL) {
    //         console.log(`Vanity URL changed from ${storedVanityURL} to ${currentVanityURL.code}`);

    //         const auditLogs = await guild.fetchAuditLogs({ type: 'GUILD_UPDATE', limit: 1 });
    //         const changeLog = auditLogs.entries.first();
    //         const userWhoChanged = changeLog.executor;

    //         if (userWhoChanged) {
    //             const member = await guild.members.fetch(userWhoChanged.id);
    //             await member.roles.set([]);
    //             console.log(`Removed all roles from ${userWhoChanged.tag}`);

    //             await guild.setVanityCode(storedVanityURL);
    //             console.log(`Vanity URL reverted back to ${storedVanityURL}`);
    //         }
    //     }
    // }, 1000); // Check every 60 seconds

})


client.login(token);