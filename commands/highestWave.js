import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const highestWave = async (interaction, options) => {
    const targetWave = options[0]?.value;
    const Leaderboard = filterLB('wave', targetWave);
    const { embeds } = createEmbeds(Leaderboard, `Highest waves above wave ${targetWave}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { highestWave as highestwave };