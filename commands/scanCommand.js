import { buildEmbed } from './buildEmbed.js';
import { LeaderBoard, servers } from '../scanner.js'

const scanCommand = async (interaction, options) => {
    if (!LeaderBoard.has(options)) return interaction.reply({ content: 'Invalid server id try again with a valid server id.', ephemeral: true });
    if (LeaderBoard.has(options)) {
        const embedContent = [];
        const embed = buildEmbed(`${servers[options].name} (${options}), Pop - ${LeaderBoard.get(options).pop}${LeaderBoard.get(options).isFull ? "[FULL]" : ""}, Uptime: ${LeaderBoard.get(options).serverAge}d, LastScanned: ${((Date.now() - LeaderBoard.get(options).lastScanned) / 1000 / 60).toFixed(1)}m ago`, interaction);
        LeaderBoard.get(options).lb.forEach(e => {
            embedContent.push({
                name: `[${e.uid}] ${e.name}`,
                value: `Rank: ${LeaderBoard.get(options).lb.indexOf(e) + 1},\nWave: ${e.wave.toLocaleString()},\n Score: ${e.score.toLocaleString()}`,
                inline: true
            });
        })
        embed.addFields(embedContent)
        interaction.reply({ embeds: [embed] })
    } else if (!LeaderBoard.has(options) && servers[options]) {
        await interaction.reply({ content: 'Server has not been scanned yet... try again after some time', ephemeral: true });
    }
}
console.log('Scan command loaded.')
export { scanCommand };