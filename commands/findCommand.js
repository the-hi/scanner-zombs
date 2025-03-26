import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const findCommand = async (interaction, options) => {
    const embeds = [];
    const filteredNames = [];
    // filter the lb
    LeaderBoard.forEach(server => {
        server.lb.forEach(lbIndex => {
            if (lbIndex.name.includes(options)) {
                lbIndex = {
                    ...lbIndex,
                    serverId: server.id,
                    isFull: server.isFull,
                    population: server.pop
                }
                filteredNames.push(lbIndex)
            }
        })
    })
    // sort the lb
    const sortedNameLb = filteredNames.sort((a, b) => b.wave - a.wave);
    // make embeds
    for (let i = 0; i < sortedNameLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Players with name ${options}, Results: ${sortedNameLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedNameLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population, position } = sortedNameLb[index];
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
export { findCommand };