import { config } from '../config.js';
import { stashSpotted, servers } from '../scanner.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';

const getStashes = async (interaction, options) => {
    if (options && !servers[options]) {
        await interaction.deferReply({ ephemeral: config.ephemeral })
        return interaction.editReply({ content: `Server ${options} not found` });
    };

    const stashes = [];
    const stashEmbeds = [];
    if (options) {
        for (const _stash in stashSpotted[options]) {
            const stash = stashSpotted[options][_stash];
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
        const embed = buildEmbed(`Stashes in ${options ? options : "game"}, Results: ${stashes.length}`, interaction);
        stashEmbeds.push(embed)
    }
    for (let x = 0; x < stashes.length; x += config.maxEmbedFields) {
        const stashFields = []
        const embed = buildEmbed(`Stashes in ${options ? options : "game"}, Results: ${stashes.length}`, interaction);
        for (let y = x; y < Math.min(stashes.length, x + config.maxEmbedFields); y++) {
            stashFields.push(stashes[y]);
        }
        embed.addFields(stashFields)
        stashEmbeds.push(embed);
    }

    // msg
    await sendEmbeds(interaction, stashEmbeds)
}
export { getStashes };