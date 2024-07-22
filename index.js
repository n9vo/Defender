const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, Partials, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

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

const webhook_whitelist = [
    '827215467587436595'
]

const log_channel = '1265077562506477720'

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

function send_log(title, message, guild) {
    const channel = guild.channels.cache.get(log_channel);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)

    channel.send({embeds: [embed]});

    console.log(`${title}: ${message}`);
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

                return; // Exit after kicking a user who is not whitelisted
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
})


client.login(token);