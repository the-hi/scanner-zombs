import WebSocket from "ws";
import BinCodec from "./codec.js";
import { config } from "./config.js";
import wasmmodule from "./wasmmodule.js";
import { client } from "./discordBot.js";
import { servers } from "./serverList.js";
import { buildEmbed } from './utils/buildEmbed.js';

let serversScanned = 0;
const stashSpotted = {};
const LeaderBoard = new Map();

// scanning part
const scanGame = (interval = config.SCAN_INTERVAL) => {
    const _servers = Object.keys(servers);
    for (let server = 0; server < _servers.length; server++) {
        setTimeout(() => {
            new Scanner(_servers[server])
        }, server * interval)
    }
}

for (const server in servers) {
    LeaderBoard.set(server, { ...servers[server], pop: 0, lb: [], highestUid: 0 })
}

const compact = (ms) => {
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);

    return [
        d ? `${d}d` : '',
        h ? `${h}h` : '',
    ].filter(Boolean).join(' ') || '0s';
}

class Scanner {
    constructor(server) {
        this.server = server;
        this.hostname = servers[server].hostname;
        this.ipAddress = servers[server].ipAddress;

        this.ws = new WebSocket(`wss://${this.hostname}:443`, { headers: { "Origin": "", "User-Agent": "" } });
        this.ws.binaryType = "arraybuffer";

        // variables here DONT FUCKING TOUCH THIS BITCH
        this.lbUpdate = 0;
        this.playersSpotted = {};
        this.entities = new Map();
        this.codec = new BinCodec();
        this.ws.onerror = () => { };
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
        server.serverAge = compact(data.startingTick * 50);

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
        this.enterWorld2 && this.ws.send(this.enterWorld2);

        server.isFull = false;
        this.playerUid = data.uid;
        server.highestUid = data.uid;
        server.lastScanned = Date.now();
        //packets to load lb
        for (let i = 0; i < 26; i++) this.sendPacket(3, { up: 1, down: 0 })
        this.ws.send(new Uint8Array([7, 0]));
        this.ws.send(new Uint8Array([9, 6, 0, 0, 0, 126, 8, 0, 0, 108, 27, 0, 0, 146, 23, 0, 0, 82, 23, 0, 0, 8, 91, 11, 0, 8, 91, 11, 0, 0, 0, 0, 0, 32, 78, 0, 0, 76, 79, 0, 0, 172, 38, 0, 0, 120, 155, 0, 0, 166, 39, 0, 0, 140, 35, 0, 0, 36, 44, 0, 0, 213, 37, 0, 0, 100, 0, 0, 0, 120, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 134, 6, 0, 0]));
    }
    onRpc(data) {
        if (data.name == "Leaderboard") {
            if (++this.lbUpdate == 2) {
                data.response = data.response.filter(player => player.uid !== this.playerUid)
                // add position data to leaderboard entries;
                for (const entry in data.response) {
                    const player = data.response[entry];
                    if (this.playersSpotted[player.uid]) {
                        data.response[entry].playerTick = this.playersSpotted[player.uid];
                        for (const stash in stashSpotted[this.server]) {
                            if (stashSpotted[this.server][stash].partyId === this.playersSpotted[player.uid].partyId) {
                                data.response[entry].stash = stashSpotted[this.server][stash];
                            }
                        }
                    }
                };
                // add old position data to leaderboard entries;
                LeaderBoard.get(this.server).lb.forEach((entry) => {
                    data.response.forEach(player => {
                        if (player.uid === entry.uid && !player.playerTick && entry.playerTick) {
                            player.playerTick = entry.playerTick;
                        }
                        if (player.uid === entry.uid && !player.stash && entry.stash) {
                            player.stash = entry.stash;
                        }
                    })
                })
                // set leaderboard
                LeaderBoard.get(this.server).lb = data.response;
                ++serversScanned;
                this.ws.close();
            }
        }
        if (data.name === 'SetPartyList') {
            for (const stash in stashSpotted[this.server]) {
                if (!data.response.find(party => party.partyId == stashSpotted[this.server][stash].partyId)) {
                    delete stashSpotted[this.server][stash];
                }
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
        this.myPlayer = this.entities.get(this.playerUid);
        // update positions
        this.entities.forEach(entity => {
            if (entity.model == 'GamePlayer' /*&& entity.uid !== this.playerUid*/) {
                this.playersSpotted[entity.uid] = entity;
            }
            // update stash
            if (entity.model == 'GoldStash') {
                !stashSpotted[this.server] && (stashSpotted[this.server] = {})
                stashSpotted[this.server][entity.uid] = entity;
            }
        })
        // delete dead stash
        for (const stash in stashSpotted[this.server]) {
            const _stash = stashSpotted[this.server][stash];
            const { x, y } = this.myPlayer.position;
            if (Math.hypot(_stash.x - x, _stash.y - y) < 800 && !this.entities.has(stash)) {
                delete stashSpotted[this.server][stash];
            }
        }
    }
    async onMessage(msg) {
        const opcode = new Uint8Array(msg.data);
        switch (opcode[0]) {
            case 5:
                wasmmodule(e => {
                    this.sendPacket(4, { displayName: "The_hi.", extra: e[5].extra });
                    this.enterWorld2 = e[6];
                    this.Module = e[10];
                }, opcode, this.ipAddress);
                return;
            case 10:
                this.sendPacket(10, { extra: this.codec.decode(opcode, this.Module).extra });
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

const totalServers = Object.keys(servers).length;
setInterval(() => {
    scanGame();
}, ((totalServers + 1) * config.SCAN_INTERVAL))

// end of scanner code
export { LeaderBoard, serversScanned, scanGame, stashSpotted };

