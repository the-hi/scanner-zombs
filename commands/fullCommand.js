import { LeaderBoard } from '../scanner.js';
import { buildEmbed } from './buildEmbed.js';

const fullCommand = async (interaction) => {
    const filledServers = [];
    const filledServerEmbed = buildEmbed(`Filled servers list`, interaction);
    LeaderBoard.forEach(server => {
        if (server.pop === 32) {
            filledServers.push({
                name: server.id,
                value: `Population: ${server.pop}, Leaderboard ` + (server.lb.length !== 0 ? "available!" : "not available:sob:."),
            })
        }
    });
    // msg
    filledServerEmbed.addFields(filledServers);
    interaction.reply({ embeds: [filledServerEmbed] })
}
export { fullCommand };