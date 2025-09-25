import { format } from "./format.js";
import { config } from "../config.js";
import { buildEmbed } from "./buildEmbed.js";

const createEmbeds = (sortedLb, title, interaction) => {
    const embeds = [];
    if (sortedLb.length === 0) embeds.push(buildEmbed(title, interaction));

    for (let i = 0; i < sortedLb.length; i += config.maxEmbedFields) {
        const embedContent = [];
        const embed = buildEmbed(title, interaction);
        for (let index = i; index < Math.min(sortedLb.length, i + config.maxEmbedFields); index++) {
            const { name, wave, score, isFull, serverId, population, stash, playerTick } = sortedLb[index];
            embedContent.push({
                name: `**(${index + 1}) ${name} (${serverId}), (${population}/32)${isFull ? "[FULL]" : ""}**`,
                value: `🢂 **Wave**: ${format(wave)} & **Score**: ${format(score)}` +
                    (playerTick ? `, \n**X: **${playerTick.position.x.toFixed(0)}**, Y: **${playerTick.position.y.toFixed(0)}**, W: **${format(playerTick.wood)}**, S: **${format(playerTick.stone)}**, G: **${format(playerTick.gold)}` : "") +
                    (stash ? `,\n**Stash**: **{ x: **${stash.position.x.toFixed(0)}**, y: **${stash.position.y.toFixed(0)}** }**` : ""),
            });
        }
        embed.setFooter({ text: `Page ${embeds.length + 1} of ${Math.ceil(sortedLb.length/config.maxEmbedFields)}` });
        embed.addFields(embedContent);
        embeds.push(embed);
    }
    return { embeds };
};

export { createEmbeds };
