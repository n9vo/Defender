const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Sends user support server'),

    
    async execute(interaction) {
        interaction.reply("https://discord.gg/MKGTFp8a")
    },
};
