import { config } from './config.js'
import { createMap } from './commands/serverLayout.js';
import { highestWave } from './commands/highestWave.js';
import { scanCommand } from './commands/scanCommand.js';
import { findCommand } from './commands/findCommand.js';
import { fullCommand } from './commands/fullCommand.js';
import { statsCommand } from './commands/statsCommand.js';
import { highestScore } from './commands/highestScore.js';
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
    ]
});

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
        name: 'layout',
        description: 'Get layout of any server. layout [serverId]',
        options: [{ name: "serverid", description: "Enter Server id", type: 3, required: true }]
    },
    {
        name: 'full',
        description: 'List of filled servers',
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
            scanCommand(int, options);
            break;
        case "stats":
            statsCommand(int);
            break;
        case "highestwave":
            highestWave(int, options)
            break;
        case "highestscore":
            highestScore(int, options)
            break;
        case "find":
            findCommand(int, options)
            break;
        case "full":
            fullCommand(int)
            break;
        case "layout":
            createMap(options, int)
            break;
    }
})

client.login(config.TOKEN);