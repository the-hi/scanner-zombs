import { config } from "../config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const sendEmbeds = async (interaction, embeds) => {
    // defer reply
    await interaction.deferReply({ ephemeral: config.ephemeral });
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
    });
    const row = new ActionRowBuilder().addComponents(buttons);
    await interaction.editReply({ embeds: [embeds[0]], components: [row] });
    // update the embeds
    let currentPage = 0;
    const totalPages = embeds.length;
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 60000, filter: (i) => i.user.id === interaction.user.id });

    collector.on('collect', async (int) => {
        // reset timer
        collector.resetTimer();
        // handle interactions
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
        // create buttons
        const buttons = [];
        ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji, index) => {
            buttons.push(new ButtonBuilder()
                .setCustomId(emoji)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emoji)
                .setDisabled(index >= 2 ? currentPage === totalPages - 1 : currentPage === 0));
        });
        // update an interaction
        const newRow = new ActionRowBuilder().addComponents(buttons);
        await int.update({ embeds: [embeds[currentPage]], components: [newRow] });
    });

    collector.on('end', async () => {
        // remove buttons
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
    });
};

export { sendEmbeds };