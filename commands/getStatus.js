import { buildEmbed } from './buildEmbed.js';
import { clientUptime, client } from '../discordBot.js';
import { serversScanned } from '../scanner.js';

const getStatus = async (interaction) => {
    const statsEmbed = buildEmbed(`Bot stats`, interaction);
    statsEmbed.addFields({ name: `Ping:`, value: `${client.ws.ping / 1000}s` });
    statsEmbed.addFields({ name: `Uptime:`, value: `${((Date.now() - clientUptime) / 1000 / 60 / 60).toFixed(3)} hours` });
    statsEmbed.addFields({ name: `Servers Scanned:`, value: `Leaderboard grabbed ${serversScanned} times.` });
    interaction.reply({ embeds: [statsEmbed] })
}
export { getStatus };