const {EmbedBuilder} = require('discord.js');

async function send_log(title, message, guild) {
    const {log_channel} = require('./config.json');

    const channel = await guild.channels.cache.get(log_channel);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)

    await channel.send({embeds: [embed]});

    console.log(`${title}: ${message}`);
}

module.exports = {send_log};