import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const findCommand = async (interaction, options) => {
    const embeds = [];
    const playersWithName = [];
    LeaderBoard.forEach(server => server.lb.forEach(lbIndex => lbIndex.name.includes(options) && (lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }, playersWithName.push(lbIndex))))
    const sortedNameLb = playersWithName.sort((a, b) => b.wave - a.wave);
    for (let i = 0; i < sortedNameLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Players with name ${options}, Results: ${sortedNameLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedNameLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population } = sortedNameLb[index];
            embedContent.push({
                name: `**${name} (${serverId})${isFull ? "[FULL]" : ""}, Population: ${population}**`,
                value: `**[Link](https://zombs.io/#/${serverId}) Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}**`
            })
        }
        embed.addFields(embedContent);
        embeds.push(embed);
    }
    // send embeds.
    await interaction.reply({ embeds: embeds })
}
console.log('Find command loaded.')
export { findCommand };