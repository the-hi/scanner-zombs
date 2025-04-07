import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const findCommand = async (interaction, options) => {
    const Leaderboard = filterLB('name', options);
    const { embeds } = createEmbeds(Leaderboard, `Players with name ${options}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { findCommand };