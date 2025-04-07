import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const highestWave = async (interaction, options) => {
    const Leaderboard = filterLB('wave', options);
    const { embeds } = createEmbeds(Leaderboard, `Highest waves above wave ${options}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { highestWave };