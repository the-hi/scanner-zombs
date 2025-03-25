import { LeaderBoard } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const highestWave = (interaction, options) => {
    const lb = [];
    const embedMessages = [];
    LeaderBoard.forEach(server => server.lb.forEach(lbIndex => lbIndex.wave >= parseInt(options) && (lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }, lb.push(lbIndex))))
    const sortedLb = lb.sort((a, b) => b.wave - a.wave);
    for (let i = 0; i < sortedLb.length; i += 20) {
        const embedContent = [];
        const embed = buildEmbed(`Highest waves above wave ${options}, Results: ${sortedLb.length}`, interaction)
        for (let index = i; index < Math.min(sortedLb.length, i + 20); index++) {
            const { name, wave, score, isFull, serverId, population } = sortedLb[index];
            embedContent.push({ name: `**${name} (${serverId})${isFull ? "[FULL]" : ""}, Population: ${population}**`, value: `**[Link](https://zombs.io/#/${serverId}) Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}**` })
        }
        embed.addFields(embedContent);
        embedMessages.push(embed);
    }
    embedMessages.forEach(async embed => {
        embedMessages.indexOf(embed) === 0 ? await interaction.reply({ embeds: [embed] }) : await interaction.channel.send({ embeds: [embed] })
    })
}
export { highestWave };