import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const highestWave = async (interaction, options) => {
    const lb = [];
    const embeds = [];
    // filter the lb
    LeaderBoard.forEach(server => {
        server.lb.forEach(lbIndex => {
            if (lbIndex.wave >= parseInt(options)) {
                lbIndex = {
                    ...lbIndex,
                    serverId: server.id,
                    isFull: server.isFull,
                    population: server.pop
                }
                lb.push(lbIndex)
            }
        })
    })
    // sort the lb
    const sortedLb = lb.sort((a, b) => b.wave - a.wave);
    // make the embeds
    for (let i = 0; i < sortedLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Highest waves above wave ${options}, Results: ${sortedLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population, position } = sortedLb[index];
            embedContent.push({
                name: `**${name} (${serverId})${isFull ? "[FULL]" : ""}, Population: ${population}**`,
                value: `**[Link](https://zombs.io/#/${serverId}) Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}` + (position ? `, position: {x: ${position.x.toFixed(0)}, y: ${position.y.toFixed(0)}}**` : "**"),
            })
        }
        embed.addFields(embedContent);
        embeds.push(embed);
    }
    // send embeds.
    for (const embed of embeds) {
        if (embeds.indexOf(embed) === 0) {
            await interaction.reply({ embeds: [embed] })
        } else {
            await interaction.followUp({ embeds: [embed] })
        }
    }
}
export { highestWave };