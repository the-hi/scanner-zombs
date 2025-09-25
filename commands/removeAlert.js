import { config } from '../config.js';
import { MessageFlags } from "discord.js";
import { buildEmbed } from '../utils/buildEmbed.js';

const removeAlert = async (interaction, options) => {
    // defer the reply
    await interaction.deferReply({ flags: config.ephemeral ? MessageFlags.Ephemeral : undefined })

    const userId = interaction.user.id;
    const serverId = options[0]?.value;

    if (!config.userAlerts[userId]) {
        const failedEmbed = buildEmbed("No alerts set.", interaction, '#FF0000');
        return await interaction.editReply({ embeds: [failedEmbed] })
    }
    if (!serverId && Object.keys(config.userAlerts[userId]).length > 0) {
        config.userAlerts[userId] = {};

        const successEmbed = buildEmbed("All alerts have been deleted.", interaction, '#88E788');
        return await interaction.editReply({ embeds: [successEmbed] })
    }
    if (config.userAlerts[userId]) {
        if (config.userAlerts[userId][serverId]) {
            const successEmbed = buildEmbed(`Alert has been deleted for ${serverId}.`, interaction, '#88E788');
            await interaction.editReply({ embeds: [successEmbed] })

            delete config.userAlerts[userId][serverId];
        } else {
            const failedEmbed = buildEmbed("No alert set for that serverId.", interaction, '#FF0000');

            return await interaction.editReply({ embeds: [failedEmbed] })
        }
    }
}
export { removeAlert as removealert };