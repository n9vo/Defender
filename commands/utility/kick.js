const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { send_log } = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true)),
    
    async execute(interaction) {
        const { admins } = require('../../config.json');
        
        if (!admins.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        try {
            await member.kick({ reason: 'kicked by command' });
            
            send_log("User kicked", `${targetUser.tag} has been kicked from the server.`, interaction.guild)

            await interaction.reply(`${targetUser.tag} has been kicked!`);
        } catch (error) {
            console.error('Error kicking user:', error);
            await interaction.reply({ content: 'There was an error trying to kick the user.', ephemeral: true });
        }
    },
};
