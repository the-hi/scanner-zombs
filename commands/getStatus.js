import { config } from '../config.js';
import { serversScanned } from '../scanner.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { clientUptime, client } from '../discordBot.js';

const compact = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(ms / 60000);
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(ms / 86400000);

    if (d >= 1) return `${d}d`;
    if (h >= 1) return `${h}h`;
    if (m >= 1) return `${m}m`;
    if (s >= 1) return `${s}s`;
    return '0s';
}

const getStatus = async (interaction) => {
    // defer the reply
    await interaction.deferReply({ ephemeral: config.ephemeral })
    
    const statsEmbed = buildEmbed(`Bot stats`, interaction);
    statsEmbed.addFields({ name: `Ping:`, value: `${client.ws.ping / 1000}s` });
    statsEmbed.addFields({ name: `Uptime:`, value: `${compact(Date.now() - clientUptime)}` });
    statsEmbed.addFields({ name: `Servers Scanned:`, value: `Leaderboard grabbed ${serversScanned} times.` });
    interaction.editReply({ embeds: [statsEmbed] });
}
export { getStatus };