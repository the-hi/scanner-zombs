import { config } from '../config.js';
import { MessageFlags } from "discord.js";
import { servers } from '../serverList.js';
import { stashSpotted } from '../scanner.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';

const getStashes = async (interaction, options) => {
    const serverId = options[0]?.value;
    if (serverId && !servers[serverId]) {
        await interaction.deferReply({ flags: config.ephemeral ? MessageFlags.Ephemeral : undefined })
        return interaction.editReply({ content: `Server ${serverId} not found` });
    };

    const stashes = [];
    const stashEmbeds = [];
    if (serverId) {
        for (const _stash in stashSpotted[serverId]) {
            const stash = stashSpotted[serverId][_stash];
            stashes.push({
                name: `**[${stash.uid}] ${stash.partyId}**`,
                value: `Tier: ${stash.tier}, x: ${stash.position.x}, y: ${stash.position.y}`
            })
        }
    } else {
        for (const server in stashSpotted) {
            const stashList = stashSpotted[server];
            for (const _stash in stashList) {
                const stash = stashList[_stash];
                stashes.push({
                    name: `**[${server}] ${stash.partyId}**`,
                    value: `Tier: ${stash.tier}, x: ${stash.position.x}, y: ${stash.position.y}`,
                    inline: true,
                })
            }
        }
    };
    if (stashes.length === 0) {
        const embed = buildEmbed(`Stashes in ${serverId ? serverId : "game"}, Results: ${stashes.length}`, interaction);
        stashEmbeds.push(embed)
    }
    for (let x = 0; x < stashes.length; x += config.maxEmbedFields) {
        const stashFields = []
        const embed = buildEmbed(`Stashes in ${serverId ? serverId : "game"}, Results: ${stashes.length}`, interaction);
        for (let y = x; y < Math.min(stashes.length, x + config.maxEmbedFields); y++) {
            stashFields.push(stashes[y]);
        }
        embed.addFields(stashFields)
        stashEmbeds.push(embed);
    }

    // msg
    await sendEmbeds(interaction, stashEmbeds)
}
export { getStashes as stashes };