import { REST, Routes, Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { LeaderBoard, servers } from './scanner.js';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
    ]
});
// UPDATE THIS PLSSS
const config = {
    TOKEN: "",
    CLIENT_ID: "1228253401016565851"
}

const rest = new REST({ version: '10' }).setToken(config.TOKEN);
const commands = [
    {
        name: 'scan',
        description: 'Get scan results of that server',
        options: [{ name: "id", description: "The id of the server", type: 3, required: true }]
    },
    {
        name: 'highestwave',
        description: 'highestWave [min wave]',
        options: [{ name: "minwave", description: "Enter the max wave you want to log", type: 3, required: true }]
    },
    {
        name: 'highestscore',
        description: 'highestScore [min score]',
        options: [{ name: "minscore", description: "Enter the max score you want to log", type: 3, required: true }]
    },
    {
        name: 'find',
        description: 'Find players that have the name inputed. find [name]',
        options: [{ name: "playername", description: "Enter player name", type: 3, required: true }]
    },
    {
        name: 'stats',
        description: 'Find game stats',
    }
];
try {
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    console.log('(/) commands. Active');
} catch (error) {
    console.error("There's something wrong", error);
}

client.on("interactionCreate", async int => {
    const options = int?.options?._hoistedOptions[0]?.value;
    switch (int.commandName) {
        case "scan":
            if (LeaderBoard.has(options)) {
                const embed = new EmbedBuilder();
                const embedContent = [];
                embed.setColor(0x0099FF);
                embed.setAuthor({ name: 'The_hi.', iconURL: 'https://cdn.discordapp.com/avatars/716532384631226408/0680fa664b24818b8911c0b6fa360eab.webp?size=32' })
                embed.setTitle(`Server id - ${options} ${servers[options].name}, Population - ${LeaderBoard.get(options).pop} ${LeaderBoard.get(options).isFull ? "[FULL]" : ""}, ServerUptime: ${LeaderBoard.get(options).serverAge}days`);
                LeaderBoard.get(options).lb.forEach(e => {
                    embedContent.push({ name: `[${e.uid}] ${e.name}`, value: `Rank: ${LeaderBoard.get(options).lb.indexOf(e) + 1},\nWave: ${e.wave.toLocaleString()},\n Score: ${e.score.toLocaleString()}.`, inline: true });
                })
                embed.addFields(embedContent)
                int.reply({ embeds: [embed] })
                return;
            } else if (!LeaderBoard.has(options) && servers[options]) {
                await int.reply({ content: 'Server has not been scanned yet... try again after some time', ephemeral: true });
                return;
            }
            await int.reply({ content: 'Invalid server id try again with a valid server id.', ephemeral: true });
            break;
        case "stats":
            const statEmbed = new EmbedBuilder();
            statEmbed.setColor(Math.random() * 16777216 | 0);
            statEmbed.setAuthor({ name: 'The_hi.', iconURL: 'https://cdn.discordapp.com/avatars/716532384631226408/0680fa664b24818b8911c0b6fa360eab.webp?size=32' })
            statEmbed.setTitle(`Zombs server stats`);
            const serverPopulations = { full: 0, high: 0, medium: 0, low: 0, currentPopulation: 0, totalPopulation: Object.keys(servers).length * 32 };
            LeaderBoard.forEach(server => {
                server.pop < 10 && ++serverPopulations.low;
                server.pop == 32 && ++serverPopulations.full;
                serverPopulations.currentPopulation += server.pop;
                server.pop >= 20 && server.pop < 32 && ++serverPopulations.high;
                server.pop >= 10 && server.pop < 20 && ++serverPopulations.medium;
                // region stats
                !serverPopulations[servers[server.id].region] && (serverPopulations[servers[server.id].region] = {})
                serverPopulations[servers[server.id].region].servers == undefined && (serverPopulations[servers[server.id].region].servers = 0);
                serverPopulations[servers[server.id].region].population == undefined && (serverPopulations[servers[server.id].region].population = 0);
                // increment stats
                serverPopulations[servers[server.id].region].servers++;
                serverPopulations[servers[server.id].region].population += server.pop;
            });
            const { full, high, medium, low, currentPopulation, totalPopulation } = serverPopulations;
            const fields = [{ name: `Server stats`, value: `Total population: ${totalPopulation},\nCurrent population: ${currentPopulation},\nFull servers: ${full},\nHigh servers: ${high},\nMedium servers: ${medium},\n Low servers: ${low}`, inline: true }]
            for (const region of ["US East", "Europe", "US West", "Asia", "Australia", "South America"]) {
                fields.push({ name: region, value: `Active servers: ${Object.values(servers).filter(e => e.region == region).length},\nTotal population: ${Object.values(servers).filter(e => e.region == region).length * 32},\nCurrent population: ${serverPopulations[region].population}`, inline: true})
            }
            statEmbed.addFields(fields);
            await int.reply({ embeds: [statEmbed] })
            break;
        case "highestwave":
            const lb = [];
            const embedMessages = [];
            LeaderBoard.forEach(server => {
                server.lb.forEach(lbIndex => {
                    if (lbIndex.wave >= parseInt(options)) {
                        lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }
                        lb.push(lbIndex);
                    }
                })
            })
            const sortedLb = lb.sort((a, b) => {
                return b.wave - a.wave
            });
            for (let i = 0; i < sortedLb.length; i += 20) {
                const embed = new EmbedBuilder();
                const embedContent = [];
                embed.setColor(Math.random() * 16777216 | 0);
                embed.setAuthor({ name: 'The_hi.', iconURL: 'https://cdn.discordapp.com/avatars/716532384631226408/0680fa664b24818b8911c0b6fa360eab.webp?size=32' })
                embed.setTitle(`Highest waves above wave ${options}, Results: ${sortedLb.length}`)
                for (let index = i; index < Math.min(sortedLb.length, i + 20); index++) {
                    const { name, wave, score, uid, isFull, serverId, population } = sortedLb[index];
                    embedContent.push({ name: `[${uid}] ${name}, Server - ${serverId}${isFull ? "[FULL]" : ""}, Population: ${population}`, value: `Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}`, })
                }
                embed.addFields(embedContent);
                embedMessages.push(embed);
            }
            embedMessages.forEach(async embed => {
                embedMessages.indexOf(embed) === 0 ? await int.reply({ embeds: [embed] }) : await int.channel.send({ embeds: [embed] })
            })
            break;
        case "highestscore":
            const scoreLb = [];
            const embeds = [];
            LeaderBoard.forEach(server => {
                server.lb.forEach(lbIndex => {
                    if (lbIndex.score >= parseInt(options)) {
                        lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }
                        scoreLb.push(lbIndex);
                    }
                })
            })
            const sortedScoreLb = scoreLb.sort((a, b) => {
                return b.score - a.score
            });
            for (let i = 0; i < sortedScoreLb.length; i += 20) {
                const embed = new EmbedBuilder();
                const embedContent = [];
                embed.setColor(Math.random() * 16777216 | 0);
                embed.setAuthor({ name: 'The_hi.', iconURL: 'https://cdn.discordapp.com/avatars/716532384631226408/0680fa664b24818b8911c0b6fa360eab.webp?size=32' })
                embed.setTitle(`Highest scores above score ${options}, Results: ${sortedScoreLb.length}`)
                for (let index = i; index < Math.min(sortedScoreLb.length, i + 20); index++) {
                    const { name, wave, score, uid, isFull, serverId, population } = sortedScoreLb[index];
                    embedContent.push({ name: `[${uid}] ${name}, Server - ${serverId}${isFull ? "[FULL]" : ""}, Population: ${population}`, value: `Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}` })
                }
                embed.addFields(embedContent);
                embeds.push(embed);
            }
            embeds.forEach(async embed => {
                embeds.indexOf(embed) === 0 ? await int.reply({ embeds: [embed] }) : await int.channel.send({ embeds: [embed] })
            })
            break;
        case "find":
            const playersWithName = [];
            const nameEmbeds = []
            LeaderBoard.forEach(server => {
                server.lb.forEach(lbIndex => {
                    if (lbIndex.name.includes(options)) {
                        lbIndex = { ...lbIndex, serverId: server.id, isFull: server.isFull, population: server.pop }
                        playersWithName.push(lbIndex);
                    }
                })
            })
            const sortedNameLb = playersWithName.sort((a, b) => {
                return b.wave - a.wave
            });
            for (let i = 0; i < sortedNameLb.length; i += 20) {
                const embed = new EmbedBuilder();
                const embedContent = [];
                embed.setColor(Math.random() * 16777216 | 0);
                embed.setAuthor({ name: 'The_hi.', iconURL: 'https://cdn.discordapp.com/avatars/716532384631226408/0680fa664b24818b8911c0b6fa360eab.webp?size=32' })
                embed.setTitle(`Highest scores above score ${options}, Results: ${sortedNameLb.length}`)
                for (let index = i; index < Math.min(sortedNameLb.length, i + 20); index++) {
                    const { name, wave, score, uid, isFull, serverId, population } = sortedNameLb[index];
                    embedContent.push({ name: `[${uid}] ${name}, Server - ${serverId}${isFull ? "[FULL]" : ""}, Population: ${population}`, value: `Wave: ${wave.toLocaleString()}, Score - ${score.toLocaleString()}` })
                }
                embed.addFields(embedContent);
                nameEmbeds.push(embed);
            }
            nameEmbeds.forEach(async embed => {
                nameEmbeds.indexOf(embed) === 0 ? await int.reply({ embeds: [embed] }) : await int.channel.send({ embeds: [embed] })
            })
            break;
    }
})

client.login(config.TOKEN);