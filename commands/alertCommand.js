import { config } from '../config.js'
import { servers } from '../scanner.js'
import { buildEmbed } from './buildEmbed.js';

const alertCommand = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0].value;
    const threshold = options[1].value;
    // if the input is invalid
    if (!servers[serverId]) {
        const failedEmbed = buildEmbed("Enter a valid serverId.", interaction, '#FF0000');
        return interaction.reply({ embeds: [failedEmbed] })
    }
    // if it is valid
    if (!config.userAlerts[userId]) config.userAlerts[userId] = {};
    if (Object.keys(config.userAlerts[userId]).length < 6) {
        if (threshold > 32 || threshold < 0) {
            const failedEmbed = buildEmbed("Enter a threshold value between 0 and 32.", interaction, '#FF0000');
            return interaction.reply({ embeds: [failedEmbed] })
        }
        config.userAlerts[userId][serverId] = {
            serverId: serverId,
            threshold: threshold,
            userId: userId,
            interaction: interaction,
        };
        const successEmbed = buildEmbed("Alert has been set successfully.", interaction, '#88E788');
        interaction.reply({ embeds: [successEmbed] })
    } else {
        const failedEmbed = buildEmbed("You have too many alerts already.", interaction, '#FF0000');
        interaction.reply({ embeds: [failedEmbed] })
    }
}
export { alertCommand };