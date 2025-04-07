import { config } from '../config.js';
import { buildEmbed } from '../utils/buildEmbed.js';
import { LeaderBoard, servers } from '../scanner.js';

const statsCommand = async (interaction) => {
    // defer the reply
    await interaction.deferReply({ ephemeral: config.ephemeral })

    const statEmbed = buildEmbed(`Zombs server stats`, interaction);
    const serverPopulations = { full: 0, high: 0, medium: 0, low: 0, currentPopulation: 0, totalPopulation: Object.keys(servers).length * 32 };
    LeaderBoard.forEach(server => {
        server.pop < 10 && ++serverPopulations.low;
        server.pop == 32 && ++serverPopulations.full;
        serverPopulations.currentPopulation += server.pop;
        server.pop >= 20 && server.pop < 32 && ++serverPopulations.high;
        server.pop >= 10 && server.pop < 20 && ++serverPopulations.medium;
        // region stats
        const { region } = servers[server.id];
        !serverPopulations[region] && (serverPopulations[region] = {})
        serverPopulations[region].servers == undefined && (serverPopulations[region].servers = 0);
        serverPopulations[region].population == undefined && (serverPopulations[region].population = 0);
        // increment stats
        serverPopulations[region].servers++;
        serverPopulations[region].population += server.pop;
    });
    // msg
    const { full, high, medium, low, currentPopulation, totalPopulation } = serverPopulations;
    const fields = [{ name: `Server stats`, value: `Total population: ${totalPopulation},\nCurrent population: ${currentPopulation},\nFull servers: ${full},\nHigh servers: ${high},\nMedium servers: ${medium},\n Low servers: ${low}`, inline: true }]
    for (const region of ["US East", "Europe", "US West", "Asia", "Australia", "South America"]) {
        const similarServers = Object.values(servers).filter(e => e.region == region);
        fields.push({
            name: region,
            value: `Active servers: ${similarServers.length},\nTotal population: ${similarServers.length * 32},\nCurrent population: ${serverPopulations[region].population}`,
            inline: true
        })
    }
    statEmbed.addFields(fields);
    await interaction.editReply({ embeds: [statEmbed] })
}
export { statsCommand };