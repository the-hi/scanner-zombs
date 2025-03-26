import { config } from '../config.js'
import { buildEmbed } from './buildEmbed.js';

const removeAlert = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0]?.value;

    if (!config.userAlters[userId]) {
        const failedEmbed = buildEmbed("No alerts set.", interaction, '#FF0000');
        return interaction.reply({ embeds: [failedEmbed] })
    }
    if (!serverId && config.userAlters[userId]) {
        config.userAlters[userId] = {};

        const successEmbed = buildEmbed("All alert have been deleted.", interaction, '#88E788');
        interaction.reply({ embeds: [successEmbed] })
    }
    if (config.userAlters[userId]) {
        if (config.userAlters[userId][serverId]) {
            const successEmbed = buildEmbed(`Alert has been deleted for ${serverId}.`, interaction, '#88E788');
            interaction.reply({ embeds: [successEmbed] })

            delete config.userAlters[userId][serverId];
        } else {
            const failedEmbed = buildEmbed("No alert set for that serverId.", interaction, '#FF0000');

            return interaction.reply({ embeds: [failedEmbed] })
        }
    }
}
export { removeAlert };