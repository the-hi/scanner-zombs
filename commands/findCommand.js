import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const findCommand = async (interaction, options) => {
    const targetName = options[0]?.value;
    const Leaderboard = filterLB('name', targetName);
    const { embeds } = createEmbeds(Leaderboard, `Players with name ${targetName}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { findCommand as find };