import { config } from "../config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const sendEmbeds = async (interaction, embeds) => {
    // initial buttons
    const buttons = [];
    ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji, index) => {
        let isDisabled = true;
        if (index >= 2 && embeds.length > 1) isDisabled = false;
        buttons.push(new ButtonBuilder()
            .setCustomId(emoji)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emoji)
            .setDisabled(isDisabled));
    })
    const row = new ActionRowBuilder().addComponents(buttons);
    // defer reply
    await interaction.deferReply({ ephemeral: config.ephemeral });
    // update the embeds
    const totalPages = embeds.length;
    await interaction.editReply({ embeds: [embeds[0]], components: [row] });

    let currentPage = 0;
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on('collect', async (int) => {
        try {
            collector.resetTimer();
            switch (int.customId) {
                case '⏮️':
                    currentPage = 0;
                    break;
                case '⏭️':
                    currentPage = totalPages - 1;
                    break;
                case '⬅️':
                    currentPage--;
                    break;
                case '➡️':
                    currentPage++;
                    break;
            }
            const buttons = [];
            ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji, index) => {
                buttons.push(new ButtonBuilder()
                    .setCustomId(emoji)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emoji)
                    .setDisabled(index >= 2 ? currentPage === totalPages - 1 : currentPage === 0));
            });
            const newRow = new ActionRowBuilder().addComponents(buttons);
            await int.update({ embeds: [embeds[currentPage]], components: [newRow] });
        } catch (error) {
            console.error('Error during collect:', error);
        }
    });

    collector.on('end', async () => {
        try {
            const buttons = [];
            ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji) => {
                buttons.push(new ButtonBuilder()
                    .setCustomId(emoji)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emoji)
                    .setDisabled(true));
            });
            const disabledRow = new ActionRowBuilder().addComponents(buttons);
            await interaction.editReply({ components: [disabledRow] });
        } catch (error) {
            console.error("Error on collector end: ", error);
        }

    });
};

export { sendEmbeds };