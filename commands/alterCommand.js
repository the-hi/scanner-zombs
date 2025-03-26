import { config } from '../config.js'

const alertCommand = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0].value;
    const threshold = options[1].value;

    if (!config.userAlters[userId]) config.userAlters[userId] = {};
    if (Object.keys(config.userAlters[userId]).length < 6) {
        if (threshold > 32 || threshold < 0) {
            return interaction.reply("Enter a threshold value between 0 and 32.")
        }
        config.userAlters[userId][serverId] = {
            serverId: serverId,
            threshold: threshold,
            userId: userId,
        };
        interaction.reply(":thumbsup:")
    } else {
        interaction.reply("You have too many alerts already.")
    }
}
export { alertCommand };