import { buildEmbed } from './buildEmbed.js';
import { LeaderBoard } from '../scanner.js'
const fullCommand = async (interaction) => {
    const filledServers = [];
    const filledServerEmbed = buildEmbed(`Filled servers list`, interaction);
    LeaderBoard.forEach(server => {
        if (server.pop === 32) {
            filledServers.push({
                name: server.id,
                value: `Population: ${server.pop}, Leaderboard ` + (server.lb.length !== 0 ? "available!" : "not available:sob:."),
                inline: true
            })
        }
    });
    // msg
    filledServerEmbed.addFields(filledServers);
    interaction.reply({ embeds: [filledServerEmbed] })
}
console.log('Filled server command loaded.')
export { fullCommand };