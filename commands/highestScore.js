import { format } from '../utils/format.js';
import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const highestScore = async (interaction, options) => {
    const LeaderBoard = filterLB('score', options);
    const { embeds } = createEmbeds(LeaderBoard, `Highest scores above score ${format(parseInt(options))}, Results: ${LeaderBoard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { highestScore };