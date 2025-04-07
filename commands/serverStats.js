import { config } from "../config.js";
import { format } from "../utils/format.js";
import { LeaderBoard } from '../scanner.js';
import { sendEmbeds } from "../utils/sendEmbeds.js";
import { buildEmbed } from '../utils/buildEmbed.js';

const serverStats = async (interaction) => {
    let serverEmbeds = [];
    for (let x = 0; x < LeaderBoard.size; x += config.maxEmbedFields) {
        const statsEmbed = buildEmbed(`Server stats`, interaction);
        for (let y = x; y < Math.min(LeaderBoard.size, x + config.maxEmbedFields); y++) {

            const server = Array.from(LeaderBoard.values())[y];

            const highestScore = server.lb[0]?.score ?? 0;
            const highestWave = server.lb.sort((a, b) => b.wave - a.wave)[0]?.wave ?? 0;
            const highestUid = server.highestUid;
            statsEmbed.addFields({
                name: `**${server.id} (${server.name}) (${server.pop}/32)**`,
                value: `- **HighestUid**: ${format(highestUid)} & **Uptime**: ${server.serverAge || 0}\n - **HighestWave**: ${format(highestWave)} & **HighestScore**: ${format(highestScore)}`
            });
        }
        statsEmbed.setFooter({ text: `Page ${serverEmbeds.length + 1} of ${Math.ceil(LeaderBoard.size / config.maxEmbedFields)}` });
        serverEmbeds.push(statsEmbed);
    }
    await sendEmbeds(interaction, serverEmbeds);
}

export { serverStats };