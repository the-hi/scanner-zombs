import { config } from '../config.js'
import { buildEmbed } from './buildEmbed.js';

const changeInterval = (interaction, options) => {
    if (interaction.user.id === config.OWNER_ID) {
        config.SCAN_INTERVAL = options;
        const successEmbed = buildEmbed(`Scan interval changed to ${options / 1000} seconds.`, interaction);
        interaction.reply({ embeds: [successEmbed] })
    } else {
        const failedEmbed = buildEmbed(`Unauthorized user. only \<@${config.OWNER_ID}> can use it`, interaction);
        interaction.reply({ embeds: [failedEmbed] })
    }
}
export { changeInterval };