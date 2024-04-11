import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import LeaderBoard from './scanner.js';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
const config = {
    TOKEN: "Nzk2NjAwNDQ4NDgzNzIxMjQ3.G4ECjL.C67jjMNN8PGG5d-SflvAuGHJqXJs87qrMhr1mY",
    CLIENT_ID: "796600448483721247"
}

const rest = new REST({ version: '10' }).setToken(config.TOKEN);
const commands = [
    {
        name: 'scan',
        description: 'Get scan results of that server.',
        options: [{ name: "id", description: "The id of the server.", type: 3, required: true }]
    },
];
try {
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    console.log('(/) commands. Active');
} catch (error) {
    console.error("There's something wrong", error);
}
const servers = JSON.parse('{"v1001":{"id":"v1001","region":"US East","name":"US East #1","hostname":"zombs-951c21a1-0.eggs.gg","ipAddress":"149.28.33.161"},"v1002":{"id":"v1002","region":"US East","name":"US East #2","hostname":"zombs-68ee87bc-0.eggs.gg","ipAddress":"104.238.135.188"},"v1003":{"id":"v1003","region":"US East","name":"US East #3","hostname":"zombs-cff65b62-0.eggs.gg","ipAddress":"207.246.91.98"},"v1004":{"id":"v1004","region":"US East","name":"US East #4","hostname":"zombs-2d4c041c-0.eggs.gg","ipAddress":"45.76.4.28"},"v1005":{"id":"v1005","region":"US East","name":"US East #5","hostname":"zombs-2d4dcbcc-0.eggs.gg","ipAddress":"45.77.203.204"},"v1006":{"id":"v1006","region":"US East","name":"US East #6","hostname":"zombs-2d4dc896-0.eggs.gg","ipAddress":"45.77.200.150"},"v1007":{"id":"v1007","region":"US East","name":"US East #7","hostname":"zombs-689ce185-0.eggs.gg","ipAddress":"104.156.225.133"},"v1009":{"id":"v1009","region":"US East","name":"US East #8","hostname":"zombs-cf941bbe-0.eggs.gg","ipAddress":"207.148.27.190"},"v1010":{"id":"v1010","region":"US East","name":"US East #9","hostname":"zombs-2d4d95e0-0.eggs.gg","ipAddress":"45.77.149.224"},"v1011":{"id":"v1011","region":"US East","name":"US East #10","hostname":"zombs-adc77b4d-0.eggs.gg","ipAddress":"173.199.123.77"},"v1012":{"id":"v1012","region":"US East","name":"US East #11","hostname":"zombs-2d4ca620-0.eggs.gg","ipAddress":"45.76.166.32"},"v1013":{"id":"v1013","region":"US East","name":"US East #12","hostname":"zombs-951c3ac1-0.eggs.gg","ipAddress":"149.28.58.193"},"v2001":{"id":"v2001","region":"US West","name":"US West #1","hostname":"zombs-2d4caf7a-0.eggs.gg","ipAddress":"45.76.175.122"},"v2002":{"id":"v2002","region":"US West","name":"US West #2","hostname":"zombs-951c4775-0.eggs.gg","ipAddress":"149.28.71.117"},"v2003":{"id":"v2003","region":"US West","name":"US West #3","hostname":"zombs-951c5784-0.eggs.gg","ipAddress":"149.28.87.132"},"v2004":{"id":"v2004","region":"US West","name":"US West #4","hostname":"zombs-cff66e0d-0.eggs.gg","ipAddress":"207.246.110.13"},"v2005":{"id":"v2005","region":"US West","name":"US West #5","hostname":"zombs-2d4c44d2-0.eggs.gg","ipAddress":"45.76.68.210"},"v2006":{"id":"v2006","region":"US West","name":"US West #6","hostname":"zombs-6c3ddbf4-0.eggs.gg","ipAddress":"108.61.219.244"},"v5001":{"id":"v5001","region":"Europe","name":"Europe #1","hostname":"zombs-5fb3f146-0.eggs.gg","ipAddress":"95.179.241.70"},"v5002":{"id":"v5002","region":"Europe","name":"Europe #2","hostname":"zombs-50f01305-0.eggs.gg","ipAddress":"80.240.19.5"},"v5003":{"id":"v5003","region":"Europe","name":"Europe #3","hostname":"zombs-d9a31dae-0.eggs.gg","ipAddress":"217.163.29.174"},"v5004":{"id":"v5004","region":"Europe","name":"Europe #4","hostname":"zombs-50f0196b-0.eggs.gg","ipAddress":"80.240.25.107"},"v5005":{"id":"v5005","region":"Europe","name":"Europe #5","hostname":"zombs-2d4d3541-0.eggs.gg","ipAddress":"45.77.53.65"},"v5006":{"id":"v5006","region":"Europe","name":"Europe #6","hostname":"zombs-5fb3a70c-0.eggs.gg","ipAddress":"95.179.167.12"},"v5007":{"id":"v5007","region":"Europe","name":"Europe #7","hostname":"zombs-5fb3a4cb-0.eggs.gg","ipAddress":"95.179.164.203"},"v5008":{"id":"v5008","region":"Europe","name":"Europe #8","hostname":"zombs-5fb3a361-0.eggs.gg","ipAddress":"95.179.163.97"},"v5009":{"id":"v5009","region":"Europe","name":"Europe #9","hostname":"zombs-c7f71341-0.eggs.gg","ipAddress":"199.247.19.65"},"v5010":{"id":"v5010","region":"Europe","name":"Europe #10","hostname":"zombs-88f4532c-0.eggs.gg","ipAddress":"136.244.83.44"},"v5011":{"id":"v5011","region":"Europe","name":"Europe #11","hostname":"zombs-2d209ed2-0.eggs.gg","ipAddress":"45.32.158.210"},"v5012":{"id":"v5012","region":"Europe","name":"Europe #12","hostname":"zombs-5fb3a911-0.eggs.gg","ipAddress":"95.179.169.17"},"v3001":{"id":"v3001","region":"Asia","name":"Asia #1","hostname":"zombs-422a3476-0.eggs.gg","ipAddress":"66.42.52.118"},"v3002":{"id":"v3002","region":"Asia","name":"Asia #2","hostname":"zombs-2d4df8b4-0.eggs.gg","ipAddress":"45.77.248.180"},"v3003":{"id":"v3003","region":"Asia","name":"Asia #3","hostname":"zombs-2d4df94b-0.eggs.gg","ipAddress":"45.77.249.75"},"v3004":{"id":"v3004","region":"Asia","name":"Asia #4","hostname":"zombs-951c9257-0.eggs.gg","ipAddress":"149.28.146.87"},"v3005":{"id":"v3005","region":"Asia","name":"Asia #5","hostname":"zombs-8bb488d9-0.eggs.gg","ipAddress":"139.180.136.217"},"v3006":{"id":"v3006","region":"Asia","name":"Asia #6","hostname":"zombs-2d4d2cb0-0.eggs.gg","ipAddress":"45.77.44.176"},"v4001":{"id":"v4001","region":"Australia","name":"Australia #1","hostname":"zombs-8bb4a905-0.eggs.gg","ipAddress":"139.180.169.5"},"v4002":{"id":"v4002","region":"Australia","name":"Australia #2","hostname":"zombs-cf9456d1-0.eggs.gg","ipAddress":"207.148.86.209"},"v4003":{"id":"v4003","region":"Australia","name":"Australia #3","hostname":"zombs-951cb6a1-0.eggs.gg","ipAddress":"149.28.182.161"},"v4004":{"id":"v4004","region":"Australia","name":"Australia #4","hostname":"zombs-951cab15-0.eggs.gg","ipAddress":"149.28.171.21"},"v4005":{"id":"v4005","region":"Australia","name":"Australia #5","hostname":"zombs-951caa7b-0.eggs.gg","ipAddress":"149.28.170.123"},"v4006":{"id":"v4006","region":"Australia","name":"Australia #6","hostname":"zombs-951ca5c7-0.eggs.gg","ipAddress":"149.28.165.199"},"v6001":{"id":"v6001","region":"South America","name":"South America #1","hostname":"zombs-951c6374-0.eggs.gg","ipAddress":"149.28.99.116"},"v6002":{"id":"v6002","region":"South America","name":"South America #2","hostname":"zombs-951c6184-0.eggs.gg","ipAddress":"149.28.97.132"},"v6003":{"id":"v6003","region":"South America","name":"South America #3","hostname":"zombs-cff648c2-0.eggs.gg","ipAddress":"207.246.72.194"},"v6004":{"id":"v6004","region":"South America","name":"South America #4","hostname":"zombs-90ca2e40-0.eggs.gg","ipAddress":"144.202.46.64"},"v6005":{"id":"v6005","region":"South America","name":"South America #5","hostname":"zombs-2d20af04-0.eggs.gg","ipAddress":"45.32.175.4"}}')

client.on("interactionCreate", async int => {
    const options = int.options._hoistedOptions[0].value;
    if (LeaderBoard.has(options)) {
        let text = ``;
        LeaderBoard.get(options).lb.forEach(e => {
            text += `name: ${e.name}, wave: ${e.wave}, score: ${e.score}, pop: ${LeaderBoard.get(options).pop}\n`;
        })
        int.reply(text)
    } else if (!LeaderBoard.has(options) && servers[options]) {
        await int.reply({ content: 'Server has not been scanned yet... try again after some time', ephemeral: true });
    } else {
        await int.reply({ content: 'Invalid server id try again with a valid server id.', ephemeral: true });
    }
})

client.login(config.TOKEN);