import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const highestScore = async (interaction, options) => {
    const embeds = [];
    const scoreLb = [];
    // filter the lb
    LeaderBoard.forEach(server => {
        server.lb.forEach(lbIndex => {
            if (lbIndex.score >= parseInt(options)) {
                lbIndex = {
                    ...lbIndex,
                    serverId: server.id,
                    isFull: server.isFull,
                    population: server.pop
                };
                scoreLb.push(lbIndex)
            }
        })
    })
    // sort the lb
    const sortedScoreLb = scoreLb.sort((a, b) => b.score - a.score);
    // make embeds
    for (let i = 0; i < sortedScoreLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Highest scores above score ${options}, Results: ${sortedScoreLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedScoreLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population, position } = sortedScoreLb[index];
            embedContent.push({
                name: `**${name} (${serverId})${isFull ? "[FULL]" : ""}, Population: ${population}**`,
                value: `**[Link](https://zombs.io/#/${serverId}) Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}` + (position ? `, position: {x: ${position.x.toFixed(0)}, y: ${position.y.toFixed(0)}}**` : "**"),
            })
        }
        embed.addFields(embedContent);
        embeds.push(embed);
    }
    // send embeds
    for (const embed of embeds) {
        if (embeds.indexOf(embed) === 0) {
            await interaction.reply({ embeds: [embed] })
        } else {
            await interaction.followUp({ embeds: [embed] })
        }
    }
}
export { highestScore };