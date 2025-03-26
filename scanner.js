import WebSocket from "ws";
import BinCodec from "./codec.js";
import { config } from './config.js'
import wasmModule from "./wasmmodule.js";
import { client } from "./discordBot.js";
import { buildEmbed } from './commands/buildEmbed.js';

let serversScanned = 0;
const LeaderBoard = new Map();
const servers = JSON.parse('{ "v1001": { "hostname": "zombs-68ee87bc-0.eggs.gg", "id": "v1001", "ipAddress": "104.238.135.188", "name": "US East #1", "region": "US East" }, "v1002": { "hostname": "zombs-cff65b62-0.eggs.gg", "id": "v1002", "ipAddress": "207.246.91.98", "name": "US East #2", "region": "US East" }, "v1003": { "hostname": "zombs-2d4c041c-0.eggs.gg", "id": "v1003", "ipAddress": "45.76.4.28", "name": "US East #3", "region": "US East" }, "v1004": { "hostname": "zombs-2d4dcbcc-0.eggs.gg", "id": "v1004", "ipAddress": "45.77.203.204", "name": "US East #4", "region": "US East" }, "v1005": { "hostname": "zombs-2d4dc896-0.eggs.gg", "id": "v1005", "ipAddress": "45.77.200.150", "name": "US East #5", "region": "US East" }, "v1006": { "hostname": "zombs-689ce185-0.eggs.gg", "id": "v1006", "ipAddress": "104.156.225.133", "name": "US East #6", "region": "US East" }, "v1007": { "hostname": "zombs-cf941bbe-0.eggs.gg", "id": "v1007", "ipAddress": "207.148.27.190", "name": "US East #7", "region": "US East" }, "v1008": { "hostname": "zombs-2d4d95e0-0.eggs.gg", "id": "v1008", "ipAddress": "45.77.149.224", "name": "US East #8", "region": "US East" }, "v1009": { "hostname": "zombs-adc77b4d-0.eggs.gg", "id": "v1009", "ipAddress": "173.199.123.77", "name": "US East #9", "region": "US East" }, "v1010": { "hostname": "zombs-2d4ca620-0.eggs.gg", "id": "v1010", "ipAddress": "45.76.166.32", "name": "US East #10", "region": "US East" }, "v1011": { "hostname": "zombs-951c3ac1-0.eggs.gg", "id": "v1011", "ipAddress": "149.28.58.193", "name": "US East #11", "region": "US East" }, "v2001": { "hostname": "zombs-951c4775-0.eggs.gg", "id": "v2001", "ipAddress": "149.28.71.117", "name": "US West #1", "region": "US West" }, "v2002": { "hostname": "zombs-951c5784-0.eggs.gg", "id": "v2002", "ipAddress": "149.28.87.132", "name": "US West #2", "region": "US West" }, "v2003": { "hostname": "zombs-2d4c44d2-0.eggs.gg", "id": "v2003", "ipAddress": "45.76.68.210", "name": "US West #3", "region": "US West" }, "v2004": { "hostname": "zombs-6c3ddbf4-0.eggs.gg", "id": "v2004", "ipAddress": "108.61.219.244", "name": "US West #4", "region": "US West" }, "v5001": { "hostname": "zombs-50f01305-0.eggs.gg", "id": "v5001", "ipAddress": "80.240.19.5", "name": "Europe #1", "region": "Europe" }, "v5002": { "hostname": "zombs-d9a31dae-0.eggs.gg", "id": "v5002", "ipAddress": "217.163.29.174", "name": "Europe #2", "region": "Europe" }, "v5003": { "hostname": "zombs-50f0196b-0.eggs.gg", "id": "v5003", "ipAddress": "80.240.25.107", "name": "Europe #3", "region": "Europe" }, "v5004": { "hostname": "zombs-2d4d3541-0.eggs.gg", "id": "v5004", "ipAddress": "45.77.53.65", "name": "Europe #4", "region": "Europe" }, "v5005": { "hostname": "zombs-5fb3a70c-0.eggs.gg", "id": "v5005", "ipAddress": "95.179.167.12", "name": "Europe #5", "region": "Europe" }, "v5006": { "hostname": "zombs-5fb3a361-0.eggs.gg", "id": "v5006", "ipAddress": "95.179.163.97", "name": "Europe #6", "region": "Europe" }, "v5007": { "hostname": "zombs-c7f71341-0.eggs.gg", "id": "v5007", "ipAddress": "199.247.19.65", "name": "Europe #7", "region": "Europe" }, "v5008": { "hostname": "zombs-88f4532c-0.eggs.gg", "id": "v5008", "ipAddress": "136.244.83.44", "name": "Europe #8", "region": "Europe" }, "v5009": { "hostname": "zombs-2d209ed2-0.eggs.gg", "id": "v5009", "ipAddress": "45.32.158.210", "name": "Europe #9", "region": "Europe" }, "v5010": { "hostname": "zombs-5fb3a911-0.eggs.gg", "id": "v5010", "ipAddress": "95.179.169.17", "name": "Europe #10", "region": "Europe" }, "v3001": { "hostname": "zombs-2d4df8b4-0.eggs.gg", "id": "v3001", "ipAddress": "45.77.248.180", "name": "Asia #1", "region": "Asia" }, "v3002": { "hostname": "zombs-2d4df94b-0.eggs.gg", "id": "v3002", "ipAddress": "45.77.249.75", "name": "Asia #2", "region": "Asia" }, "v3003": { "hostname": "zombs-8bb488d9-0.eggs.gg", "id": "v3003", "ipAddress": "139.180.136.217", "name": "Asia #3", "region": "Asia" }, "v3004": { "hostname": "zombs-2d4d2cb0-0.eggs.gg", "id": "v3004", "ipAddress": "45.77.44.176", "name": "Asia #4", "region": "Asia" }, "v4001": { "hostname": "zombs-cf9456d1-0.eggs.gg", "id": "v4001", "ipAddress": "207.148.86.209", "name": "Australia #1", "region": "Australia" }, "v4002": { "hostname": "zombs-951cb6a1-0.eggs.gg", "id": "v4002", "ipAddress": "149.28.182.161", "name": "Australia #2", "region": "Australia" }, "v4003": { "hostname": "zombs-951caa7b-0.eggs.gg", "id": "v4003", "ipAddress": "149.28.170.123", "name": "Australia #3", "region": "Australia" }, "v4004": { "hostname": "zombs-951ca5c7-0.eggs.gg", "id": "v4004", "ipAddress": "149.28.165.199", "name": "Australia #4", "region": "Australia" }, "v6001": { "hostname": "zombs-951c6374-0.eggs.gg", "id": "v6001", "ipAddress": "149.28.99.116", "name": "South America #1", "region": "South America" }, "v6002": { "hostname": "zombs-cff648c2-0.eggs.gg", "id": "v6002", "ipAddress": "207.246.72.194", "name": "South America #2", "region": "South America" }, "v6003": { "hostname": "zombs-2d20af04-0.eggs.gg", "id": "v6003", "ipAddress": "45.32.175.4", "name": "South America #3", "region": "South America" } }')// code starts here.

for (const server in servers) LeaderBoard.set(server, { id: server, pop: 0, lb: [] })

class Scanner {
    constructor(server) {
        this.server = server;
        this.hostname = servers[server].hostname;
        this.ipAddress = servers[server].ipAddress;

        this.ws = new WebSocket(`wss://${this.hostname}:443`, { headers: { "Origin": "", "User-Agent": "" } });
        this.ws.binaryType = "arraybuffer";

        // variables here DONT FUCKING TOUCH THIS BITCH
        this.lbUpdate = 0;
        this.stashSpotted = {};
        this.playersSpotted = {};
        this.entities = new Map();
        this.Module = wasmModule();
        this.codec = new BinCodec();
        this.ws.onerror = () => { }
        this.ws.onmessage = this.onMessage.bind(this);
    }
    sendPacket(event, data) {
        if (this.ws.readyState == 1) {
            this.ws.send(this.codec.encode(event, data));
        }
    }
    onEnterWorld(data) {
        const server = LeaderBoard.get(this.server)
        server.pop = data.players;
        server.serverAge = (data.startingTick * 50 / 1000 / 60 / 60 / 24).toFixed(2);

        for (const users in config.userAlerts) {
            const user = config.userAlerts[users];
            if (user[this.server] && server.pop >= parseInt(user[this.server].threshold)) {
                const discord = client.users.cache.get(user[this.server].userId);
                const embed1 = buildEmbed(`${this.server} has surpassed the threshold you've set. Current population: ${server.pop}`, user[this.server].interaction, '#88E788')
                const embed2 = buildEmbed(`The alert you've set has been deleted. alert [serverId] [threshold] to set another alert.`, user[this.server].interaction, '#88E788')

                discord.send({ embeds: [embed1, embed2] })

                delete user[this.server];
            }
        }
        if (!data.allowed) return (server.isFull = true);
        server.isFull = false;
        server.lastScanned = Date.now();
        //opcode 6
        this.enterworld2 && this.ws.send(this.enterworld2);
        //packets to load lb
        this.playerUid = data.uid;
        for (let i = 0; i < 26; i++) this.ws.send(new Uint8Array([3, 17, 123, 34, 117, 112, 34, 58, 49, 44, 34, 100, 111, 119, 110, 34, 58, 48, 125]));
        this.ws.send(new Uint8Array([7, 0]));
        this.ws.send(new Uint8Array([9, 6, 0, 0, 0, 126, 8, 0, 0, 108, 27, 0, 0, 146, 23, 0, 0, 82, 23, 0, 0, 8, 91, 11, 0, 8, 91, 11, 0, 0, 0, 0, 0, 32, 78, 0, 0, 76, 79, 0, 0, 172, 38, 0, 0, 120, 155, 0, 0, 166, 39, 0, 0, 140, 35, 0, 0, 36, 44, 0, 0, 213, 37, 0, 0, 100, 0, 0, 0, 120, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 134, 6, 0, 0]));
    }
    onRpc(data) {
        if (data.name == "Leaderboard") {
            if (++this.lbUpdate == 2) {
                // add position data to leaderboard entries;
                for (const entry in data.response) {
                    const player = data.response[entry]
                    if (this.playersSpotted[player.uid]) {
                        data.response[entry].position = this.playersSpotted[player.uid].position;
                    }
                };
                LeaderBoard.get(this.server).lb.forEach((entry, key) => {
                    data.response.forEach(player => {
                        if (player.uid === entry.uid && !player.position && entry.position) {
                            player.position = entry.position;
                        }
                    })
                })
                // set leaderboard
                LeaderBoard.get(this.server).lb = data.response;
                ++serversScanned;
                this.ws.close();
            }
        }
    }
    onEntity(data) {
        data.entities.forEach((entity, key) => {
            if (!this.entities.has(key)) {
                this.entities.set(key, entity)
            } else {
                for (const attribute in entity) {
                    this.entities.get(key)[attribute] = entity[attribute]
                }
            }
        })
        // update positions
        this.entities.forEach(entity => {
            if (entity.model == 'GamePlayer' && entity.uid !== this.playerUid) {
                this.playersSpotted[entity.uid] = { position: entity.position };
            }
            /*if (entity.model == 'GoldStash') {
                this.stashSpotted[entity.uid] = {
                    position: entity.position,
                    partyId: entity.partyId,
                    tier: entity.tier
                };
            }*/
        })
    }
    async onMessage(msg) {
        const opcode = new Uint8Array(msg.data);
        switch (opcode[0]) {
            case 5:
                this.Module.onDecodeOpcode5(opcode, this.ipAddress, decodedopcode5 => {
                    this.sendPacket(4, { displayName: "the_hi.", extra: decodedopcode5[5] });
                    this.enterworld2 = decodedopcode5[6];
                });
                return;
            case 10:
                this.ws.send(this.Module.finalizeOpcode10(opcode));
                return;
            case 4:
                this.onEnterWorld(this.codec.decode(msg.data))
                break;
            case 9:
                this.onRpc(this.codec.decode(msg.data))
                break;
            case 0:
                this.onEntity(this.codec.decode(msg.data))
                break;
        }
    }
}
// scanning part
const scanGame = (interval = config.SCAN_INTERVAL) => {
    const _servers = Object.keys(servers);
    for (let server = 0; server < _servers.length; server++) {
        setTimeout(() => {
            new Scanner(_servers[server])
        }, server * interval)
    }
}
setInterval(() => {
    scanGame();
}, 240000)
// end of scanner code

export { LeaderBoard, servers, serversScanned, scanGame };

