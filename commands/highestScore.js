import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const highestScore = async (interaction, options) => {
    const embeds = [];
    const scoreLb = [];
    LeaderBoard.forEach(server => server.lb.forEach(lbIndex => lbIndex.score >= parseInt(options) && (lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }, scoreLb.push(lbIndex))))
    const sortedScoreLb = scoreLb.sort((a, b) => b.score - a.score);
    for (let i = 0; i < sortedScoreLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Highest scores above score ${options}, Results: ${sortedScoreLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedScoreLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population } = sortedScoreLb[index];
            embedContent.push({
                name: `**${name} (${serverId})${isFull ? "[FULL]" : ""}, Population: ${population}**`,
                value: `**[Link](https://zombs.io/#/${serverId}) Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}**`
            })
        }
        embed.addFields(embedContent);
        embeds.push(embed);
    }
    // send embeds
    await interaction.reply({ embeds: embeds })
}
console.log('HighestScore command loaded.')
export { highestScore };