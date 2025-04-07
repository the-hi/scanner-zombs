import { config } from '../config.js';
import { format } from '../utils/format.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { LeaderBoard, servers } from '../scanner.js';

const compact = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(ms / 60000);
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(ms / 86400000);

    let compact = '0s';
    [d, h, m, s].forEach((item, index) => {
        if (item >= 1) {
            compact = `${item}${['d', 'h', 'm', 's'][index]}`
        } 
    })
    return compact;
}

const scanCommand = async (interaction, options) => {
    // defer the reply
    await interaction.deferReply({ ephemeral: config.ephemeral })

    if (!LeaderBoard.has(options) && !servers[options]) {
        const failedEmbed = buildEmbed(`Invalid serverId, try again with a valid serverId.`, interaction, '#FF0000');
        return await interaction.editReply({ embeds: [failedEmbed] })
    };
    if (LeaderBoard.has(options)) {
        const embedContent = [];
        const server = LeaderBoard.get(options);
        const embed = buildEmbed(`${servers[options].name} (${options}) (${server.pop}/32)${server.isFull ? "[FULL]" : ""} & Uptime: ${server.serverAge ? server.serverAge : '0s'} \nLastScanned: ${server.lastScanned ? compact(Date.now() - server.lastScanned) + " ago" : "Never."}`, interaction);
        server.lb.forEach((player, index) => {
            const { name, wave, uid, score, playerTick, stash } = player;
            embedContent.push({
                name: `(${index + 1}) [${uid}] ${name}`,
                value: `Wave: ${format(wave)}, Score: ${format(score)}` +
                    (playerTick ? `, \nX: ${playerTick.position.x.toFixed(0)}, Y: ${playerTick.position.y.toFixed(0)}, W: ${format(playerTick.wood)}, S: ${format(playerTick.stone)}, G: ${format(playerTick.gold)}` : "") +
                    (stash ? `,\nStash - X: ${stash.position.x.toFixed(0)}, Y: ${stash.position.y.toFixed(0)}` : ""),
            });
        })
        embed.addFields(embedContent)
        await interaction.editReply({ embeds: [embed] })
    } else if (!LeaderBoard.has(options) && servers[options]) {
        const failedEmbed = buildEmbed(`Server has not been scanned yet.`, interaction, '#FF0000');
        return await interaction.editReply({ embeds: [failedEmbed] })
    }
}
export { scanCommand };