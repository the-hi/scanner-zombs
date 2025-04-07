import { EmbedBuilder } from 'discord.js';
const buildEmbed = (title, interaction, color = Math.random() * 16777216 | 0) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setAuthor({
            name: interaction.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp?size=512`
        })

}
export { buildEmbed };