import { config } from '../config.js';
import { LeaderBoard } from '../scanner.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';

const fullCommand = async (interaction) => {
    const filledServers = [];
    const filledServerEmbeds = [];
    LeaderBoard.forEach(server => {
        if (server.isFull) {
            filledServers.push({
                name: `**[${server.id}] ${server.name}**`,
                value: `Leaderboard ` + (server.lb.length !== 0 ? "available!" : "not available :sob:"),
            })
        }
    });
    for (let x = 0; x < filledServers.length; x += config.maxEmbedFields) {
        const fields = [];
        const embed = buildEmbed(`Filled servers list, Results: ${filledServers.length}`, interaction);
        for (let y = x; y < Math.min(filledServers.length, x + config.maxEmbedFields); y++) {
            fields.push(filledServers[y])
        }
        embed.addFields(fields);
        filledServerEmbeds.push(embed);
    }
    // msg
    await sendEmbeds(interaction, filledServerEmbeds)
}
export { fullCommand };