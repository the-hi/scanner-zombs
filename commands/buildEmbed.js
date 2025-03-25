import { EmbedBuilder } from 'discord.js';
const buildEmbed = (title, interaction) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(Math.random() * 16777216 | 0)
        .setAuthor({ 
            name: interaction.user.username, 
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp?size=32` 
        })
}
export { buildEmbed };