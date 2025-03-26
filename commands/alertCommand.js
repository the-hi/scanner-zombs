import { config } from '../config.js'
import { buildEmbed } from './buildEmbed.js';

const alertCommand = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0].value;
    const threshold = options[1].value;

    if (!config.userAlters[userId]) config.userAlters[userId] = {};
    if (Object.keys(config.userAlters[userId]).length < 6) {
        if (threshold > 32 || threshold < 0) {
            const failedEmbed = buildEmbed("Enter a threshold value between 0 and 32.", interaction);
            return interaction.reply({ embeds: [failedEmbed] })
        }
        config.userAlters[userId][serverId] = {
            serverId: serverId,
            threshold: threshold,
            userId: userId,
            interaction: interaction,
        };
        const successEmbed = buildEmbed("Alert has been successfully set.", interaction);
        interaction.reply({ embeds: [successEmbed] })
    } else {
        const failedEmbed = buildEmbed("You have too many alerts already.", interaction);
        interaction.reply({ embeds: [failedEmbed] })
    }
}
export { alertCommand };