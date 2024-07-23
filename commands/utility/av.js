const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('av')
        .setDescription('Shows avatar & banner of user')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to get the avatar and banner of')
                .setRequired(true)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        
        try {
            const user = await interaction.client.users.fetch(targetUser.id, { force: true });

            const embed = new EmbedBuilder()
                .setTitle(`${user.tag}'s Info`)
                .setColor('#00ff00')
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setImage(user.bannerURL({ dynamic: true, size: 1024 }) || '')
                .addFields(
                    { name: 'User ID', value: user.id, inline: true },
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Discriminator', value: user.discriminator, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: 'User Info', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user:', error);
            await interaction.reply('Could not fetch user information.');
        }
    },
};
