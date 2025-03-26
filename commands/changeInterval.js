import { config } from '../config.js'
import { buildEmbed } from './buildEmbed.js';

const changeInterval = (interaction, options) => {
    if (interaction.user.id === config.OWNER_ID) {
        config.SCAN_INTERVAL = options;
        const successEmbed = buildEmbed(`Scan interval changed to ${options / 1000} seconds.`, interaction, '#88E788');
        interaction.reply({ embeds: [successEmbed] })
    } else {
        console.log(interaction.user)
        const failedEmbed = buildEmbed(`Unauthorized user.`, interaction, '#FF0000');
        interaction.reply({ embeds: [failedEmbed] })
    }
}
export { changeInterval };