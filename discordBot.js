import { config } from './config.js'
import { getStatus } from './commands/getStatus.js';
import { getStashes } from './commands/getStashes.js';
import { createMap } from './commands/serverLayout.js';
import { serverStats } from './commands/serverStats.js';
import { highestWave } from './commands/highestWave.js';
import { scanCommand } from './commands/scanCommand.js';
import { findCommand } from './commands/findCommand.js';
import { fullCommand } from './commands/fullCommand.js';
import { removeAlert } from './commands/removeAlert.js';
import { statsCommand } from './commands/statsCommand.js';
import { alertCommand } from './commands/alertCommand.js';
import { highestScore } from './commands/highestScore.js';
import { REST, Routes, Client, GatewayIntentBits, PresenceUpdateStatus, MessageFlags } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{ name: 'jking is gay.' }],
        status: PresenceUpdateStatus.DoNotDisturb
    });

    client.user.setAvatar('https://cdn.discordapp.com/avatars/1284523392850071636/ef5a9ed7c007f1671301bc3464dc4ab2.webp?size=512')
});

const clientUptime = Date.now();
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
        options: [{ name: "minwave", description: "Enter the min wave you want to log", type: 3, required: true }]
    },
    {
        name: 'highestscore',
        description: 'highestScore [min score]',
        options: [{ name: "minscore", description: "Enter the min score you want to log", type: 3, required: true }]
    },
    {
        name: 'find',
        description: 'Find players that have the name inputed. find [name]',
        options: [{ name: "playername", description: "Enter player name", type: 3, required: true }]
    },
    {
        name: 'layout',
        description: 'Get layout of any server. layout [serverId]',
        options: [{ name: "serverid", description: "Enter serverId", type: 3, required: true }]
    },
    {
        name: 'full',
        description: 'List of filled servers',
    },
    {
        name: 'stats',
        description: 'Find game stats',
    },
    {
        name: 'alert',
        description: 'get alerts when server pop reaches a threshold, alter [serverId] [threshold pop]',
        options: [{ name: "serverid", description: "Enter serverId", type: 3, required: true }, { name: "threshold", description: "Enter threshold", type: 3, required: true }]
    },
    {
        name: 'removealert',
        description: "remove alerts that you've set, removealter [serverId, deletes all alerts if serverId absent]",
        options: [{ name: "serverid", description: "Enter serverId", type: 3, required: false }]
    },
    {
        name: 'stashes',
        description: "Get all stashes present in a server.",
        options: [{ name: "serverid", description: "Enter serverId", type: 3, required: false }]
    },
    {
        name: 'status',
        description: "Get status of the bot.",
    },
    {
        name: 'servers',
        description: "Get info about all servers.",
    }
];

try {
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    console.log('(/) commands. Active');
} catch (error) {
    console.error("There's something wrong", error);
}

client.on("interactionCreate", async int => {
    const options = int?.options?._hoistedOptions;
    console.log(int.user.username, int.commandName, options);

    switch (int.commandName) {
        case "scan":
            scanCommand(int, options[0]?.value);
            break;
        case "stats":
            statsCommand(int);
            break;
        case "highestwave":
            highestWave(int, options[0]?.value);
            break;
        case "highestscore":
            highestScore(int, options[0]?.value);
            break;
        case "find":
            findCommand(int, options[0]?.value);
            break;
        case "full":
            fullCommand(int);
            break;
        case "layout":
            createMap(int, options[0]?.value);
            break;
        case "alert":
            alertCommand(int, options);
            break;
        case "removealert":
            removeAlert(int, options);
            break;
        case "status":
            getStatus(int, options);
            break;
        case "stashes":
            getStashes(int, options[0]?.value)
            break;
        case "servers":
            serverStats(int);
            break;
    }
})

client.login(config.TOKEN);

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
export { client, clientUptime };