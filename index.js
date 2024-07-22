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

const WEBHOOK_CREATION_LIMIT = 5; // Number of webhooks allowed per minute
const WEBHOOK_CREATION_TIME_WINDOW = 60000; // Time window in milliseconds (1 minute)

let webhookCreationMap = new Map();

client.on("webhooksUpdate", async (webhook) => {
	const guildId = webhook.guild.id;
    const currentTime = Date.now();
    
    if (!webhookCreationMap.has(guildId)) {
        webhookCreationMap.set(guildId, []);
    }
    
    const creationTimes = webhookCreationMap.get(guildId);
    creationTimes.push({ time: currentTime, webhookId: webhook.id, creatorId: webhook.creator.id });

    // Remove timestamps outside the time window
    const recentTimes = creationTimes.filter(entry => currentTime - entry.time <= WEBHOOK_CREATION_TIME_WINDOW);
    webhookCreationMap.set(guildId, recentTimes);

    const creatorIds = recentTimes.map(entry => entry.creatorId);
    const uniqueCreators = [...new Set(creatorIds)];

    if (uniqueCreators.length > WEBHOOK_CREATION_LIMIT) {
        console.log(`Kicking user due to excessive webhook creation.`);
        
        try {
            const guild = await client.guilds.fetch(guildId);
            for (const creatorId of uniqueCreators) {
                const member = await guild.members.fetch(creatorId);
                if (member) {
                    await member.kick('Excessive webhook creation.');
                    console.log(`Kicked user ${member.user.tag} (${creatorId}) for creating too many webhooks.`);
                }
            }
        } catch (error) {
            console.error(`Failed to kick user(s):`, error);
        }
    }
});

client.once(Events.ClientReady, () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
})


client.login(token);