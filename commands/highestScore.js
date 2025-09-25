import { format } from '../utils/format.js';
import { filterLB } from '../utils/filter.js';
import { sendEmbeds } from '../utils/sendEmbeds.js';
import { createEmbeds } from '../utils/createEmbeds.js';

const highestScore = async (interaction, options) => {
    const targetScore = options[0]?.value;
    const LeaderBoard = filterLB('score', targetScore);
    const { embeds } = createEmbeds(LeaderBoard, `Highest scores above score ${format(parseInt(targetScore))}, Results: ${LeaderBoard.length}`, interaction);

    await sendEmbeds(interaction, embeds);
};

export { highestScore as highestscore };