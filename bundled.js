import WebSocket from 'ws';
import ByteBuffer from 'bytebuffer';
import { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client, GatewayIntentBits, PresenceUpdateStatus, REST, Routes } from 'discord.js';
import { Jimp } from 'jimp';
import fetch from 'node-fetch';

// UPDATE THIS PLSSS
const config = {
    userAlerts: {},
    ephemeral: false, // if true, the reply will be ephemeral
    maxEmbedFields: 20, // max fields in embed
    SCAN_INTERVAL: 11000, // interval to scan each server
    OWNER_ID: "1284523392850071636", // ID of owner
    CLIENT_ID: "1354010463007936573", // clientId of bot
    TOKEN: "MTM1NDAxMDQ2MzAwNzkzNjU3Mw.GLhaU6.9RqlWTg8xY97wEkGbf3PZu7qwRyGbMvSXNOiW4", // Token of bot
};

// Bincodec for decoding packets

const PacketIds_1 = JSON.parse('{"default":{"0":"PACKET_ENTITY_UPDATE","1":"PACKET_PLAYER_COUNTER_UPDATE","2":"PACKET_SET_WORLD_DIMENSIONS","3":"PACKET_INPUT","4":"PACKET_ENTER_WORLD","5":"PACKET_PRE_ENTER_WORLD","6":"PACKET_ENTER_WORLD2","7":"PACKET_PING","9":"PACKET_RPC","10":"PACKET_BLEND","PACKET_PRE_ENTER_WORLD":5,"PACKET_ENTER_WORLD":4,"PACKET_ENTER_WORLD2":6,"PACKET_ENTITY_UPDATE":0,"PACKET_INPUT":3,"PACKET_PING":7,"PACKET_PLAYER_COUNTER_UPDATE":1,"PACKET_RPC":9,"PACKET_SET_WORLD_DIMENSIONS":2,"PACKET_BLEND":10}}');
const e_AttributeType = JSON.parse("{\"0\":\"Uninitialized\",\"1\":\"Uint32\",\"2\":\"Int32\",\"3\":\"Float\",\"4\":\"String\",\"5\":\"Vector2\",\"6\":\"EntityType\",\"7\":\"ArrayVector2\",\"8\":\"ArrayUint32\",\"9\":\"Uint16\",\"10\":\"Uint8\",\"11\":\"Int16\",\"12\":\"Int8\",\"13\":\"Uint64\",\"14\":\"Int64\",\"15\":\"Double\",\"Uninitialized\":0,\"Uint32\":1,\"Int32\":2,\"Float\":3,\"String\":4,\"Vector2\":5,\"EntityType\":6,\"ArrayVector2\":7,\"ArrayUint32\":8,\"Uint16\":9,\"Uint8\":10,\"Int16\":11,\"Int8\":12,\"Uint64\":13,\"Int64\":14,\"Double\":15}");
const e_ParameterType = JSON.parse("{\"0\":\"Uint32\",\"1\":\"Int32\",\"2\":\"Float\",\"3\":\"String\",\"4\":\"Uint64\",\"5\":\"Int64\",\"Uint32\":0,\"Int32\":1,\"Float\":2,\"String\":3,\"Uint64\":4,\"Int64\":5}");

class BinCodec {
    constructor() {
        this.attributeMaps = {};
        this.entityTypeNames = {};
        this.rpcMaps = [{ "name": "message", "parameters": [{ "name": "msg", "type": 3 }], "isArray": false, "index": 0 }, { "name": "serverObj", "parameters": [{ "name": "data", "type": 3 }], "isArray": false, "index": 1 }];
        this.rpcMapsByName = { "message": { "name": "message", "parameters": [{ "name": "msg", "type": 3 }], "isArray": false, "index": 0 }, "serverObj": { "name": "serverObj", "parameters": [{ "name": "data", "type": 3 }], "isArray": false, "index": 1 } };
        this.sortedUidsByType = {};
        this.removedEntities = {};
        this.absentEntitiesFlags = [];
        this.updatedEntityFlags = [];
        this.startedDecoding = Date.now();
    }
    encode(name, item, Module) {
        let buffer = new ByteBuffer(100, true);
        switch (name) {
            case PacketIds_1.default.PACKET_ENTER_WORLD:
                buffer.writeUint8(PacketIds_1.default.PACKET_ENTER_WORLD);
                this.encodeEnterWorld(buffer, item);
                break;
            case PacketIds_1.default.PACKET_ENTER_WORLD2:
                buffer.writeUint8(PacketIds_1.default.PACKET_ENTER_WORLD2);
                this.encodeEnterWorld2(buffer, Module);
                break;
            case PacketIds_1.default.PACKET_INPUT:
                buffer.writeUint8(PacketIds_1.default.PACKET_INPUT);
                this.encodeInput(buffer, item);
                break;
            case PacketIds_1.default.PACKET_PING:
                buffer.writeUint8(PacketIds_1.default.PACKET_PING);
                this.encodePing(buffer, item);
                break;
            case PacketIds_1.default.PACKET_RPC:
                buffer.writeUint8(PacketIds_1.default.PACKET_RPC);
                this.encodeRpc(buffer, item);
                break;
            case PacketIds_1.default.PACKET_BLEND:
                buffer.writeUint8(PacketIds_1.default.PACKET_BLEND);
                this.encodeBlend(buffer, item);
                break;
        }
        buffer.flip();
        buffer.compact();
        return buffer.toArrayBuffer(false);
    };
    decode(data, Module) {
        let buffer = ByteBuffer.wrap(data);
        buffer.littleEndian = true;
        let opcode = buffer.readUint8();
        let decoded;
        switch (opcode) {
            case PacketIds_1.default.PACKET_PRE_ENTER_WORLD:
                decoded = this.decodePreEnterWorldResponse(buffer, Module);
                break;
            case PacketIds_1.default.PACKET_ENTER_WORLD:
                decoded = this.decodeEnterWorldResponse(buffer);
                break;
            case PacketIds_1.default.PACKET_ENTITY_UPDATE:
                decoded = this.decodeEntityUpdate(buffer);
                break;
            case PacketIds_1.default.PACKET_PING:
                decoded = this.decodePing(buffer);
                break;
            case PacketIds_1.default.PACKET_RPC:
                decoded = this.decodeRpc(buffer);
                break;
            case PacketIds_1.default.PACKET_BLEND:
                this.decodeBlend(buffer);
                break;
        }
        decoded.opcode = opcode;
        return decoded;
    };
    safeReadVString(buffer) {
        let offset = buffer.offset;
        let len = buffer.readVarint32(offset);
        try {
            var func = buffer.readUTF8String.bind(buffer);
            var str = func(len.value, "b", offset += len.length);
            offset += str.length;
            buffer.offset = offset;
            return str.string;
        }
        catch (e) {
            offset += len.value;
            buffer.offset = offset;
            return '?';
        }
    };
    decodePreEnterWorldResponse(buffer, Module_ = Module) {
        this.startedDecoding = Date.now();

        Module_._MakeBlendField(24, 132);
        for (let firstSync = Module_._MakeBlendField(228, 132), i = 0; buffer.remaining();)
            Module_.HEAPU8[firstSync + i] = buffer.readUint8(), i++;
        Module_._MakeBlendField(172, 36);
        for (var secondSync = Module_._MakeBlendField(4, 152), extraBuffers = new ArrayBuffer(64), exposedBuffers = new Uint8Array(extraBuffers), i = 0; i < 64; i++) {
            exposedBuffers[i] = Module_.HEAPU8[secondSync + i];
        }
        return {
            extra: extraBuffers
        };
    }
    decodeEnterWorldResponse(buffer) {
        let allowed = buffer.readUint32();
        let uid = buffer.readUint32();
        let startingTick = buffer.readUint32();
        let ret = {
            allowed: allowed,
            uid: uid,
            startingTick: startingTick,
            tickRate: buffer.readUint32(),
            effectiveTickRate: buffer.readUint32(),
            players: buffer.readUint32(),
            maxPlayers: buffer.readUint32(),
            chatChannel: buffer.readUint32(),
            effectiveDisplayName: this.safeReadVString(buffer),
            x1: buffer.readInt32(),
            y1: buffer.readInt32(),
            x2: buffer.readInt32(),
            y2: buffer.readInt32()
        };
        let attributeMapCount = buffer.readUint32();
        this.attributeMaps = {};
        this.entityTypeNames = {};
        for (let i = 0; i < attributeMapCount; i++) {
            let attributeMap = [];
            let entityType = buffer.readUint32();
            let entityTypeString = buffer.readVString();
            let attributeCount = buffer.readUint32();
            for (let j = 0; j < attributeCount; j++) {
                let name_1 = buffer.readVString();
                let type = buffer.readUint32();
                attributeMap.push({
                    name: name_1,
                    type: type
                });
            }
            this.attributeMaps[entityType] = attributeMap;
            this.entityTypeNames[entityType] = entityTypeString;
            this.sortedUidsByType[entityType] = [];
        }
        let rpcCount = buffer.readUint32();
        this.rpcMaps = [];
        this.rpcMapsByName = {};
        for (let i = 0; i < rpcCount; i++) {
            let rpcName = buffer.readVString();
            let paramCount = buffer.readUint8();
            let isArray = buffer.readUint8() != 0;
            let parameters = [];
            for (let j = 0; j < paramCount; j++) {
                let paramName = buffer.readVString();
                let paramType = buffer.readUint8();
                parameters.push({
                    name: paramName,
                    type: paramType
                });
            }
            let rpc = {
                name: rpcName,
                parameters: parameters,
                isArray: isArray,
                index: this.rpcMaps.length
            };
            this.rpcMaps.push(rpc);
            this.rpcMapsByName[rpcName] = rpc;
        }
        return ret;
    };
    decodeEntityUpdate(buffer) {
        let tick = buffer.readUint32();
        let removedEntityCount = buffer.readVarint32();
        const entityUpdateData = {};
        entityUpdateData.tick = tick;
        entityUpdateData.entities = new Map();
        let rE = Object.keys(this.removedEntities);
        for (let i = 0; i < rE.length; i++) {
            delete this.removedEntities[rE[i]];
        }
        for (let i = 0; i < removedEntityCount; i++) {
            var uid = buffer.readUint32();
            this.removedEntities[uid] = 1;
        }
        let brandNewEntityTypeCount = buffer.readVarint32();
        for (let i = 0; i < brandNewEntityTypeCount; i++) {
            var brandNewEntityCountForThisType = buffer.readVarint32();
            var brandNewEntityType = buffer.readUint32();
            for (var j = 0; j < brandNewEntityCountForThisType; j++) {
                var brandNewEntityUid = buffer.readUint32();
                this.sortedUidsByType[brandNewEntityType].push(brandNewEntityUid);
            }
        }
        let SUBT = Object.keys(this.sortedUidsByType);
        for (let i = 0; i < SUBT.length; i++) {
            let table = this.sortedUidsByType[SUBT[i]];
            let newEntityTable = [];
            for (let j = 0; j < table.length; j++) {
                let uid = table[j];
                if (!(uid in this.removedEntities)) {
                    newEntityTable.push(uid);
                }
            }
            newEntityTable.sort((a, b) => a - b);
            this.sortedUidsByType[SUBT[i]] = newEntityTable;
        }
        while (buffer.remaining()) {
            let entityType = buffer.readUint32();
            if (!(entityType in this.attributeMaps)) {
                throw new Error('Entity type is not in attribute map: ' + entityType);
            }
            let absentEntitiesFlagsLength = Math.floor((this.sortedUidsByType[entityType].length + 7) / 8);
            this.absentEntitiesFlags.length = 0;
            for (let i = 0; i < absentEntitiesFlagsLength; i++) {
                this.absentEntitiesFlags.push(buffer.readUint8());
            }
            let attributeMap = this.attributeMaps[entityType];
            for (let tableIndex = 0; tableIndex < this.sortedUidsByType[entityType].length; tableIndex++) {
                let uid = this.sortedUidsByType[entityType][tableIndex];
                if ((this.absentEntitiesFlags[Math.floor(tableIndex / 8)] & (1 << (tableIndex % 8))) !== 0) {
                    entityUpdateData.entities.set(uid, true);
                    continue;
                }
                var player = {
                    uid: uid
                };
                this.updatedEntityFlags.length = 0;
                for (let j = 0; j < Math.ceil(attributeMap.length / 8); j++) {
                    this.updatedEntityFlags.push(buffer.readUint8());
                }
                for (let j = 0; j < attributeMap.length; j++) {
                    let attribute = attributeMap[j];
                    let flagIndex = Math.floor(j / 8);
                    let bitIndex = j % 8;
                    let count = void 0;
                    let v = [];
                    if (this.updatedEntityFlags[flagIndex] & (1 << bitIndex)) {
                        switch (attribute.type) {
                            case e_AttributeType.Uint32:
                                player[attribute.name] = buffer.readUint32();
                                break;
                            case e_AttributeType.Int32:
                                player[attribute.name] = buffer.readInt32();
                                break;
                            case e_AttributeType.Float:
                                player[attribute.name] = buffer.readInt32() / 100;
                                break;
                            case e_AttributeType.String:
                                player[attribute.name] = this.safeReadVString(buffer);
                                break;
                            case e_AttributeType.Vector2:
                                let x = buffer.readInt32() / 100;
                                let y = buffer.readInt32() / 100;
                                player[attribute.name] = { x: x, y: y };
                                break;
                            case e_AttributeType.ArrayVector2:
                                count = buffer.readInt32();
                                v = [];
                                for (let i = 0; i < count; i++) {
                                    let x_1 = buffer.readInt32() / 100;
                                    let y_1 = buffer.readInt32() / 100;
                                    v.push({ x: x_1, y: y_1 });
                                }
                                player[attribute.name] = v;
                                break;
                            case e_AttributeType.ArrayUint32:
                                count = buffer.readInt32();
                                v = [];
                                for (let i = 0; i < count; i++) {
                                    let element = buffer.readInt32();
                                    v.push(element);
                                }
                                player[attribute.name] = v;
                                break;
                            case e_AttributeType.Uint16:
                                player[attribute.name] = buffer.readUint16();
                                break;
                            case e_AttributeType.Uint8:
                                player[attribute.name] = buffer.readUint8();
                                break;
                            case e_AttributeType.Int16:
                                player[attribute.name] = buffer.readInt16();
                                break;
                            case e_AttributeType.Int8:
                                player[attribute.name] = buffer.readInt8();
                                break;
                            case e_AttributeType.Uint64:
                                player[attribute.name] = buffer.readUint32() + buffer.readUint32() * 4294967296;
                                break;
                            case e_AttributeType.Int64:
                                let s64 = buffer.readUint32();
                                let s642 = buffer.readInt32();
                                if (s642 < 0) {
                                    s64 *= -1;
                                }
                                s64 += s642 * 4294967296;
                                player[attribute.name] = s64;
                                break;
                            case e_AttributeType.Double:
                                let s64d = buffer.readUint32();
                                let s64d2 = buffer.readInt32();
                                if (s64d2 < 0) {
                                    s64d *= -1;
                                }
                                s64d += s64d2 * 4294967296;
                                s64d = s64d / 100;
                                player[attribute.name] = s64d;
                                break;
                            default:
                                throw new Error('Unsupported attribute type: ' + attribute.type);
                        }
                    }
                }
                entityUpdateData.entities.set(player.uid, player);
            }
        }
        entityUpdateData.byteSize = buffer.capacity();
        return entityUpdateData;
    };
    decodePing() {
        return {};
    };
    encodeRpc(buffer, item) {
        if (!(item.name in this.rpcMapsByName)) {
            throw new Error('RPC not in map: ' + item.name);
        }
        var rpc = this.rpcMapsByName[item.name];
        buffer.writeUint32(rpc.index);
        for (var i = 0; i < rpc.parameters.length; i++) {
            var param = item[rpc.parameters[i].name];
            switch (rpc.parameters[i].type) {
                case e_ParameterType.Float:
                    buffer.writeInt32(Math.floor(param * 100.0));
                    break;
                case e_ParameterType.Int32:
                    buffer.writeInt32(param);
                    break;
                case e_ParameterType.String:
                    buffer.writeVString(param);
                    break;
                case e_ParameterType.Uint32:
                    buffer.writeUint32(param);
                    break;
            }
        }
    };
    decodeRpcObject(buffer, parameters) {
        var result = {};
        for (var i = 0; i < parameters.length; i++) {
            switch (parameters[i].type) {
                case e_ParameterType.Uint32:
                    result[parameters[i].name] = buffer.readUint32();
                    break;
                case e_ParameterType.Int32:
                    result[parameters[i].name] = buffer.readInt32();
                    break;
                case e_ParameterType.Float:
                    result[parameters[i].name] = buffer.readInt32() / 100.0;
                    break;
                case e_ParameterType.String:
                    result[parameters[i].name] = this.safeReadVString(buffer);
                    break;
                case e_ParameterType.Uint64:
                    result[parameters[i].name] = buffer.readUint32() + buffer.readUint32() * 4294967296;
                    break;
            }
        }
        return result;
    };
    decodeRpc(buffer) {
        var rpcIndex = buffer.readUint32();
        var rpc = this.rpcMaps[rpcIndex];
        var result = {
            name: rpc.name,
            response: null
        };
        if (!rpc.isArray) {
            result.response = this.decodeRpcObject(buffer, rpc.parameters);
        } else {
            var response = [];
            var count = buffer.readUint16();
            for (var i = 0; i < count; i++) {
                response.push(this.decodeRpcObject(buffer, rpc.parameters));
            }
            result.response = response;
        }
        return result;
    };
    encodeEnterWorld(buffer, item) {
        buffer.writeVString(item.displayName);
        for (var e = new Uint8Array(item.extra), i = 0; i < item.extra.byteLength; i++)
            buffer.writeUint8(e[i]);
    }
    encodeEnterWorld2(buffer, Module_ = Module) {
        var managementcommandsdns = Module_._MakeBlendField(187, 22);
        for (var siteName = 0; siteName < 16; siteName++) {
            buffer.writeUint8(Module_.HEAPU8[managementcommandsdns + siteName]);
        }
    };
    encodeInput(buffer, item) {
        buffer.writeVString(JSON.stringify(item));
    };
    encodePing(buffer) {
        buffer.writeUint8(0);
    };
}

let wasmbuffers = [];
fetch("https://cdn.glitch.global/7d28c753-c81a-408d-9529-94f5b60a0e4d/zombs_wasm.wasm").then(e => e.arrayBuffer().then(r => {
    wasmbuffers = r;
    scanGame()
}));


const wasmmodule = () => {
    let uid = 0;
    function setHeaps() {
        var buffer = exportG.buffer;
        exports.HEAPU8 = HEAPU8 = new Uint8Array(buffer);
    }
    function instantiate(file, methods, callback) {
        WebAssembly.instantiate(wasmbuffers, methods).then(e => callback(e));
    }
    function initializeInstance() {
        function asmInstanceCallback(asm) {
            exports.asm = asm.exports;
            exportG = exports.asm.g;
            exports.asm.h();
            exports.asm.i();
            setHeaps();
            Module.ready = true;
            Module.opcode5Callback && Module.onDecodeOpcode5(Module.blended, Module.hostname, Module.opcode5Callback);
            return exports.asm;
        }
        instantiate("", {
            'a': methods
        }, (asm) => {
            asmInstanceCallback(asm.instance);
        });
    }
    var exports = {};
    var exportG;
    var HEAPU8;
    var decoder = new TextDecoder('utf8');
    var intCalc = function (heapu8, int) {
        for (var n = int; heapu8[n] && !(n >= NaN);) ++n;
        if (n - int > 0x10 && heapu8.buffer && decoder) return decoder.decode(heapu8.subarray(int, n));
        for (var finalInt = ''; int < n;) {
            var e = heapu8[int++];
            if (0x80 & e) {
                var j = 0x3f & heapu8[int++];
                if (0xc0 != (0xe0 & e)) {
                    var k = 0x3f & heapu8[int++];
                    if (e = 0xe0 == (0xf0 & e) ? (0xf & e) << 0xc | j << 0x6 | k : (0x7 & e) << 0x12 | j << 0xc | k << 0x6 | 0x3f & heapu8[int++], e < 0x10000)
                        finalInt += String.fromCharCode(e);
                    else {
                        var diff = e - 0x10000;
                        finalInt += String.fromCharCode(0xd800 | diff >> 0xa, 0xdc00 | 0x3ff & diff);
                    }
                } else finalInt += String.fromCharCode((0x1f & e) << 0x6 | j);
            } else finalInt += String.fromCharCode(e);
        }
        return finalInt;
    };
    var intToStr = function (int) {
        return intCalc(HEAPU8, int);
    };
    var repeater = function (int) {
        return 0 | cstr(intToStr(int));
    };
    var getBufferDifference = function (ipAddress, buffer, bufferSize, undf) {
        if (!(undf > 0)) {
            return 0;
        }
        var byteSize = bufferSize;
        var int = bufferSize + undf - 1;
        for (var i = 0; i < ipAddress.length; ++i) {
            var charCode = ipAddress.charCodeAt(i);
            if (charCode >= 0xd800 && charCode <= 0xdfff) {
                var _charCode = ipAddress.charCodeAt(++i);
                charCode = 0x10000 + ((0x3ff & charCode) << 0xa) | 0x3ff & _charCode;
            }
            if (charCode <= 0x7f) {
                if (bufferSize >= int) break;
                buffer[bufferSize++] = charCode;
            } else {
                if (charCode <= 0x7ff) {
                    if (bufferSize + 0x1 >= int) break;
                    buffer[bufferSize++] = 0xc0 | charCode >> 0x6,
                        buffer[bufferSize++] = 0x80 | 0x3f & charCode;
                } else {
                    if (charCode <= 0xffff) {
                        if (bufferSize + 0x2 >= int) break;
                        buffer[bufferSize++] = 0xe0 | charCode >> 0xc,
                            buffer[bufferSize++] = 0x80 | charCode >> 0x6 & 0x3f,
                            buffer[bufferSize++] = 0x80 | 0x3f & charCode;
                    } else {
                        if (bufferSize + 0x3 >= int) break;
                        buffer[bufferSize++] = 0xf0 | charCode >> 0x12,
                            buffer[bufferSize++] = 0x80 | charCode >> 0xc & 0x3f,
                            buffer[bufferSize++] = 0x80 | charCode >> 0x6 & 0x3f,
                            buffer[bufferSize++] = 0x80 | 0x3f & charCode;
                    }
                }
            }
        }
        buffer[bufferSize] = 0;
        return bufferSize - byteSize;
    };
    let cstr = (str) => {
        if (str.startsWith('typeof window === "undefined" ? 1 : 0')) return 0;
        if (str.startsWith("typeof process !== 'undefined' ? 1 : 0")) return 0;
        if (str.startsWith('Game.currentGame.network.connected ? 1 : 0')) return 1;
        if (str.startsWith('Game.currentGame.network.connectionOptions.ipAddress')) return Module.hostname;
        if (str.startsWith('Game.currentGame.world.myUid === null ? 0 : Game.currentGame.world.myUid')) return ((uid++) ? 0 : 696969);
        if (str.startsWith('document.getElementById("hud").children.length')) return 24;
    };
    var importA = function aFunction(int) {
        var ipAddress = cstr(intToStr(int));
        if (null == ipAddress) {
            return 0;
        }
        ipAddress += '';
        var func = aFunction;
        func.bufferSize = ipAddress.length + 1;
        func.buffer = asmL(func.bufferSize);
        getBufferDifference(ipAddress, HEAPU8, func.buffer, func.bufferSize);
        return func.buffer;
    };
    var methods = {
        'd': () => { },
        'f': () => { },
        'c': () => performance.now(),
        'e': () => { },
        'b': repeater,
        'a': importA
    };
    initializeInstance();
    var asmL = function () {
        return (asmL = exports.asm.l).apply(null, arguments);
    };
    const Module = exports;
    Module.decodeBlendInternal = blended => {
        Module.asm.j(24, 132);
        const pos = Module.asm.j(228, 132);
        const extra = new Uint8Array(blended);
        for (let i = 0; i < 132; i++) {
            Module.HEAPU8[pos + i] = extra[i + 1];
        }
        Module.asm.j(172, 36);
        const index = Module.asm.j(4, 152);
        const arraybuffer = new ArrayBuffer(64);
        const list = new Uint8Array(arraybuffer);
        for (let i = 0; i < 64; i++) {
            list[i] = Module.HEAPU8[index + i];
        }
        return arraybuffer;
    };
    Module.onDecodeOpcode5 = (blended, hostname, callback) => {
        Module.blended = blended;
        Module.hostname = hostname;
        if (!Module.ready) return (Module.opcode5Callback = callback);
        Module.asm.j(255, 140);
        const decoded = Module.decodeBlendInternal(blended);
        const mcs = Module.asm.j(187, 22);
        const opcode6Data = [6];
        for (let i = 0; i < 16; i++) {
            opcode6Data.push(Module.HEAPU8[mcs + i]);
        }
        callback({ 5: decoded, 6: new Uint8Array(opcode6Data) });
    };
    Module.finalizeOpcode10 = blended => {
        const decoded = Module.decodeBlendInternal(blended);
        const list = new Uint8Array(decoded);
        const data = [10];
        for (let i = 0; i < decoded.byteLength; i++) {
            data.push(list[i]);
        }
        return new Uint8Array(data);
    };
    return Module;
};

const buildEmbed$1 = (title, interaction, color = Math.random() * 16777216 | 0) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setAuthor({
            name: interaction.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp?size=512`
        })

};

let serversScanned = 0;
const stashSpotted = {};
const LeaderBoard = new Map();
const servers = JSON.parse('{ "v1001": { "hostname": "zombs-68ee87bc-0.eggs.gg", "id": "v1001", "ipAddress": "104.238.135.188", "name": "US East #1", "region": "US East" }, "v1002": { "hostname": "zombs-cff65b62-0.eggs.gg", "id": "v1002", "ipAddress": "207.246.91.98", "name": "US East #2", "region": "US East" }, "v1003": { "hostname": "zombs-2d4c041c-0.eggs.gg", "id": "v1003", "ipAddress": "45.76.4.28", "name": "US East #3", "region": "US East" }, "v1004": { "hostname": "zombs-2d4dcbcc-0.eggs.gg", "id": "v1004", "ipAddress": "45.77.203.204", "name": "US East #4", "region": "US East" }, "v1005": { "hostname": "zombs-2d4dc896-0.eggs.gg", "id": "v1005", "ipAddress": "45.77.200.150", "name": "US East #5", "region": "US East" }, "v1006": { "hostname": "zombs-689ce185-0.eggs.gg", "id": "v1006", "ipAddress": "104.156.225.133", "name": "US East #6", "region": "US East" }, "v1007": { "hostname": "zombs-cf941bbe-0.eggs.gg", "id": "v1007", "ipAddress": "207.148.27.190", "name": "US East #7", "region": "US East" }, "v1008": { "hostname": "zombs-2d4d95e0-0.eggs.gg", "id": "v1008", "ipAddress": "45.77.149.224", "name": "US East #8", "region": "US East" }, "v1009": { "hostname": "zombs-adc77b4d-0.eggs.gg", "id": "v1009", "ipAddress": "173.199.123.77", "name": "US East #9", "region": "US East" }, "v1010": { "hostname": "zombs-2d4ca620-0.eggs.gg", "id": "v1010", "ipAddress": "45.76.166.32", "name": "US East #10", "region": "US East" }, "v1011": { "hostname": "zombs-951c3ac1-0.eggs.gg", "id": "v1011", "ipAddress": "149.28.58.193", "name": "US East #11", "region": "US East" }, "v2001": { "hostname": "zombs-951c4775-0.eggs.gg", "id": "v2001", "ipAddress": "149.28.71.117", "name": "US West #1", "region": "US West" }, "v2002": { "hostname": "zombs-951c5784-0.eggs.gg", "id": "v2002", "ipAddress": "149.28.87.132", "name": "US West #2", "region": "US West" }, "v2003": { "hostname": "zombs-2d4c44d2-0.eggs.gg", "id": "v2003", "ipAddress": "45.76.68.210", "name": "US West #3", "region": "US West" }, "v2004": { "hostname": "zombs-6c3ddbf4-0.eggs.gg", "id": "v2004", "ipAddress": "108.61.219.244", "name": "US West #4", "region": "US West" }, "v5001": { "hostname": "zombs-50f01305-0.eggs.gg", "id": "v5001", "ipAddress": "80.240.19.5", "name": "Europe #1", "region": "Europe" }, "v5002": { "hostname": "zombs-d9a31dae-0.eggs.gg", "id": "v5002", "ipAddress": "217.163.29.174", "name": "Europe #2", "region": "Europe" }, "v5003": { "hostname": "zombs-50f0196b-0.eggs.gg", "id": "v5003", "ipAddress": "80.240.25.107", "name": "Europe #3", "region": "Europe" }, "v5004": { "hostname": "zombs-2d4d3541-0.eggs.gg", "id": "v5004", "ipAddress": "45.77.53.65", "name": "Europe #4", "region": "Europe" }, "v5005": { "hostname": "zombs-5fb3a70c-0.eggs.gg", "id": "v5005", "ipAddress": "95.179.167.12", "name": "Europe #5", "region": "Europe" }, "v5006": { "hostname": "zombs-5fb3a361-0.eggs.gg", "id": "v5006", "ipAddress": "95.179.163.97", "name": "Europe #6", "region": "Europe" }, "v5007": { "hostname": "zombs-c7f71341-0.eggs.gg", "id": "v5007", "ipAddress": "199.247.19.65", "name": "Europe #7", "region": "Europe" }, "v5008": { "hostname": "zombs-88f4532c-0.eggs.gg", "id": "v5008", "ipAddress": "136.244.83.44", "name": "Europe #8", "region": "Europe" }, "v5009": { "hostname": "zombs-2d209ed2-0.eggs.gg", "id": "v5009", "ipAddress": "45.32.158.210", "name": "Europe #9", "region": "Europe" }, "v5010": { "hostname": "zombs-5fb3a911-0.eggs.gg", "id": "v5010", "ipAddress": "95.179.169.17", "name": "Europe #10", "region": "Europe" }, "v3001": { "hostname": "zombs-2d4df8b4-0.eggs.gg", "id": "v3001", "ipAddress": "45.77.248.180", "name": "Asia #1", "region": "Asia" }, "v3002": { "hostname": "zombs-2d4df94b-0.eggs.gg", "id": "v3002", "ipAddress": "45.77.249.75", "name": "Asia #2", "region": "Asia" }, "v3003": { "hostname": "zombs-8bb488d9-0.eggs.gg", "id": "v3003", "ipAddress": "139.180.136.217", "name": "Asia #3", "region": "Asia" }, "v3004": { "hostname": "zombs-2d4d2cb0-0.eggs.gg", "id": "v3004", "ipAddress": "45.77.44.176", "name": "Asia #4", "region": "Asia" }, "v4001": { "hostname": "zombs-cf9456d1-0.eggs.gg", "id": "v4001", "ipAddress": "207.148.86.209", "name": "Australia #1", "region": "Australia" }, "v4002": { "hostname": "zombs-951cb6a1-0.eggs.gg", "id": "v4002", "ipAddress": "149.28.182.161", "name": "Australia #2", "region": "Australia" }, "v4003": { "hostname": "zombs-951caa7b-0.eggs.gg", "id": "v4003", "ipAddress": "149.28.170.123", "name": "Australia #3", "region": "Australia" }, "v4004": { "hostname": "zombs-951ca5c7-0.eggs.gg", "id": "v4004", "ipAddress": "149.28.165.199", "name": "Australia #4", "region": "Australia" }, "v6001": { "hostname": "zombs-951c6374-0.eggs.gg", "id": "v6001", "ipAddress": "149.28.99.116", "name": "South America #1", "region": "South America" }, "v6002": { "hostname": "zombs-cff648c2-0.eggs.gg", "id": "v6002", "ipAddress": "207.246.72.194", "name": "South America #2", "region": "South America" }, "v6003": { "hostname": "zombs-2d20af04-0.eggs.gg", "id": "v6003", "ipAddress": "45.32.175.4", "name": "South America #3", "region": "South America" } }');// code starts here.
for (const server in servers) LeaderBoard.set(server, { ...servers[server], pop: 0, lb: [], highestUid: 0 });

const compact$2 = (ms) => {
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);

    return [
        d ? `${d}d` : '',
        h ? `${h}h` : '',
    ].filter(Boolean).join(' ') || '0s';
};

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
        this.Module = wasmmodule();
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
        const server = LeaderBoard.get(this.server);
        server.pop = data.players;
        server.serverAge = compact$2(data.startingTick * 50);

        for (const users in config.userAlerts) {
            const user = config.userAlerts[users];
            if (user[this.server] && server.pop >= parseInt(user[this.server].threshold)) {
                const discord = client.users.cache.get(user[this.server].userId);
                const embed1 = buildEmbed$1(`${this.server} has surpassed the threshold you've set. Current population: ${server.pop}`, user[this.server].interaction, '#88E788');
                const embed2 = buildEmbed$1(`The alert you've set has been deleted. alert [serverId] [threshold] to set another alert.`, user[this.server].interaction, '#88E788');

                discord.send({ embeds: [embed1, embed2] });

                delete user[this.server];
            }
        }

        if (!data.allowed) return (server.isFull = true);
        this.enterworld2 && this.ws.send(this.enterworld2);

        server.isFull = false;
        this.playerUid = data.uid;
        server.highestUid = data.uid;
        server.lastScanned = Date.now();
        //packets to load lb
        for (let i = 0; i < 26; i++) this.sendPacket(3, { up: 1, down: 0 });
        this.ws.send(new Uint8Array([7, 0]));
        this.ws.send(new Uint8Array([9, 6, 0, 0, 0, 126, 8, 0, 0, 108, 27, 0, 0, 146, 23, 0, 0, 82, 23, 0, 0, 8, 91, 11, 0, 8, 91, 11, 0, 0, 0, 0, 0, 32, 78, 0, 0, 76, 79, 0, 0, 172, 38, 0, 0, 120, 155, 0, 0, 166, 39, 0, 0, 140, 35, 0, 0, 36, 44, 0, 0, 213, 37, 0, 0, 100, 0, 0, 0, 120, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 134, 6, 0, 0]));
    }
    onRpc(data) {
        if (data.name == "Leaderboard") {
            if (++this.lbUpdate == 2) {
                data.response = data.response.filter(player => player.uid !== this.playerUid);
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
                }                // add old position data to leaderboard entries;
                LeaderBoard.get(this.server).lb.forEach((entry) => {
                    data.response.forEach(player => {
                        if (player.uid === entry.uid && !player.playerTick && entry.playerTick) {
                            player.playerTick = entry.playerTick;
                        }
                        if (player.uid === entry.uid && !player.stash && entry.stash) {
                            player.stash = entry.stash;
                        }
                    });
                });
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
                this.entities.set(key, entity);
            } else {
                for (const attribute in entity) {
                    this.entities.get(key)[attribute] = entity[attribute];
                }
            }
        });
        this.myPlayer = this.entities.get(this.playerUid);
        // update positions
        this.entities.forEach(entity => {
            if (entity.model == 'GamePlayer' /*&& entity.uid !== this.playerUid*/) {
                this.playersSpotted[entity.uid] = entity;
            }
            // update stash
            if (entity.model == 'GoldStash') {
                !stashSpotted[this.server] && (stashSpotted[this.server] = {});
                stashSpotted[this.server][entity.uid] = entity;
            }
        });
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
                this.Module.onDecodeOpcode5(opcode, this.ipAddress, decodedopcode5 => {
                    this.sendPacket(4, { displayName: "the_hi.", extra: decodedopcode5[5] });
                    this.enterworld2 = decodedopcode5[6];
                });
                return;
            case 4:
                this.onEnterWorld(this.codec.decode(msg.data));
                break;
            case 9:
                this.onRpc(this.codec.decode(msg.data));
                break;
            case 0:
                this.onEntity(this.codec.decode(msg.data));
                break;
        }
    }
}
// scanning part
const scanGame = (interval = config.SCAN_INTERVAL) => {
    const _servers = Object.keys(servers);
    for (let server = 0; server < _servers.length; server++) {
        setTimeout(() => {
            new Scanner(_servers[server]);
        }, server * interval);
    }
};
setInterval(() => {
    scanGame();
}, (37 * config.SCAN_INTERVAL));

const compact$1 = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(ms / 60000);
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(ms / 86400000);

    if (d >= 1) return `${d}d`;
    if (h >= 1) return `${h}h`;
    if (m >= 1) return `${m}m`;
    if (s >= 1) return `${s}s`;
    return '0s';
};

const getStatus = async (interaction) => {
    const statsEmbed = buildEmbed$1(`Bot stats`, interaction);
    statsEmbed.addFields({ name: `Ping:`, value: `${client.ws.ping / 1000}s` });
    statsEmbed.addFields({ name: `Uptime:`, value: `${compact$1(Date.now() - clientUptime)}` });
    statsEmbed.addFields({ name: `Servers Scanned:`, value: `Leaderboard grabbed ${serversScanned} times.` });
    interaction.editReply({ embeds: [statsEmbed], ephemeral: config.ephemeral });
};

const getStashes = async (interaction, options) => {
    if (options && !stashSpotted[options]) {
        return interaction.editReply({ content: `Server ${options} not found`, ephemeral: config.ephemeral });
    }
    const stashes = [];
    let fetchedStashEmbed;
    if (options) {
        fetchedStashEmbed = buildEmbed$1(`Stashes in ${options}, results: ${Object.keys(stashSpotted[options]).length}`, interaction);
        for (const _stash in stashSpotted[options]) {
            const stash = stashSpotted[options][_stash];
            stashes.push({
                name: `**[${stash.uid}] ${stash.partyId}**`,
                value: `Tier: ${stash.tier}, x: ${stash.position.x}, y: ${stash.position.y}`
            });
        }
    } else {// all stashes
        let total = 0;
        for (const server in stashSpotted) {
            const stashList = stashSpotted[server];
            total += Object.keys(stashSpotted[server]).length;
            for (const _stash in stashList) {
                const stash = stashList[_stash];
                stashes.push({
                    name: `**[${server}] ${stash.partyId}**`,
                    value: `Tier: ${stash.tier}, x: ${stash.position.x}, y: ${stash.position.y}`,
                    inline: true,
                });
            }
        }
        fetchedStashEmbed = buildEmbed$1(`Stashes in game, results: ${total}`, interaction);
    }
    // msg
    fetchedStashEmbed.addFields(stashes);
    interaction.editReply({ embeds: [fetchedStashEmbed], ephemeral: config.ephemeral });
};

const createMap = async (interaction, serverId) => {
    if (!serverSpots[serverId]) {
        const failedEmbed = buildEmbed("Invalid serverId.", interaction, '#FF0000');
        return interaction.editReply({ embeds: [failedEmbed] })
    }

    const spots = serverSpots[serverId].spots;
    const image = new Jimp({ width: 2400, height: 2400, color: '#688D41' });
    for (const resource in spots) {
        const { model, position } = spots[resource];
        const pixelColor = ({
            Stone: 0xC9C9C9FF,
            Tree: 0x2D4317FF,
            NeutralCamp: 0xBD3C45FF
        })[model];
        for (let x = Math.floor(Math.round(position.x / 10) - 9.6); x <= Math.ceil(Math.round(position.x / 10) + 9.6); x++) {
            for (let y = Math.floor(Math.round(position.y / 10) - 9.6); y <= Math.ceil(Math.round(position.y / 10) + 9.6); y++) {
                if ((x - Math.round(position.x / 10)) ** 2 + (y - Math.round(position.y / 10)) ** 2 <= 9.6 ** 2) {
                    image.setPixelColor(pixelColor, Math.round(x), Math.round(y));
                }
            }
        }
    }
    // send the image
    const buffer = await image.getBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: `${serverId}.png` });
    await interaction.editReply({ files: [attachment] });
};

let serverSpots;

const filterText = (text) => {
    let index = text.indexOf("window.serverspots = {");
    if (index < 0) return null;

    let braces = 1;
    let end = index + "window.serverspots = {".length;
    while (braces > 0 && end < text.length) {
        if (text[end] === '{') braces++;
        else if (text[end] === '}') braces--;
        end++;
    }
    const newText = text.substring("window.serverspots = ".length, end);
    return braces === 0 ? newText.replaceAll("v", `"v`).replaceAll(": {", `": {`).replaceAll("spotEncoded", `"spotEncoded"`).replaceAll("'", `"`).replaceAll("spotinfo", `"spotinfo"`) : null;
};

const detectModelByUid = (uid) => {
    if (0 < uid && uid <= 400) {
        return "Tree";
    }
    if (400 < uid && uid <= 800) {
        return "Stone";
    }
    if (800 < uid && uid <= 825) {
        return "NeutralCamp";
    }
};

const getRealPosOfIndex = (index) => {
    return {
        x: ((((index * 100).toFixed(2) - "") % 5000000) | 0) / 100,
        y: (index / 50000 | 0) / 100
    }
};

const decodeSpotJSON = (json) => {
    let arr = JSON.parse(json);
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        arr[i] && (obj[i + 1] = {
            model: detectModelByUid(i + 1),
            position: getRealPosOfIndex(arr[i]),
            uid: i + 1
        });
    }
    return obj;
};

fetch("https://zombs-server-spots.glitch.me/serverspots.js").then(e => e.text()).then(e => {
    const spotsJSON = JSON.parse(filterText(e));
    for (const server in spotsJSON) {
        spotsJSON[server].spots = decodeSpotJSON(spotsJSON[server].spotEncoded);
        delete spotsJSON[server].spotEncoded;
    }
    serverSpots = spotsJSON;
    console.log('Server spots fetched.');
});

const format = (number) => {
    return new Intl.NumberFormat("en-GB", {
        notation: "compact",
        compactDisplay: "short"
    }).format(number);
};

const serverStats = async (interaction) => {
    let serverEmbeds = [];
    for (let x = 0; x < LeaderBoard.size; x += config.maxEmbedFields) {
        const statsEmbed = buildEmbed$1(`Server stats`, interaction);
        for (let y = x; y < Math.min(LeaderBoard.size, x + config.maxEmbedFields); y++) {
            const server = Array.from(LeaderBoard.values())[y];

            const highestScore = server.lb[0]?.score ?? 0;
            const highestWave = server.lb.sort((a, b) => b.wave - a.wave)[0]?.wave ?? 0;
            const highestUid = server.highestUid.toLocaleString();
            statsEmbed.addFields({
                name: `**${server.id} (${server.name}) (${server.pop}/32)**`,
                value: `- **HighestUid**: ${format(highestUid)} & **Uptime**: ${server.serverAge || 0}\n - **HighestWave**: ${format(highestWave)} & **HighestScore**: ${format(highestScore)}`
            });
        }
        serverEmbeds.push(statsEmbed);
    }
    interaction.editReply({ embeds: serverEmbeds });
};

const filterLB = (type, options) => {
    const nameType = type === 'name';
    const filterCondition = (lbIndex) => nameType
        ? lbIndex[type].toLowerCase().includes(options.toLowerCase())
        : lbIndex[type] >= parseInt(options);

    const filteredLB = Array.from(LeaderBoard.values()).flatMap(server =>
        server.lb.filter(filterCondition)
            .map(lbIndex => ({
                ...lbIndex,
                serverId: server.id,
                isFull: server.isFull,
                population: server.pop
            }))
    );

    const sortKey = nameType ? 'wave' : type;
    return filteredLB.sort((a, b) => b[sortKey] - a[sortKey]);
};

const sendEmbeds = async (interaction, embeds, row) => {
    // send first embed
    const totalPages = embeds.length;
    embeds[0].setFooter({ text: `Page 1 of ${totalPages}` });
    await interaction.editReply({ embeds: [embeds[0]], components: [row] });

    let currentPage = 0;
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 60000, filter: (i) => i.user.id === interaction.user.id, });

    collector.on('collect', interaction => {
        collector.resetTimer();// reset the timer on button click
        switch (interaction.customId) {
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
        const buttons = [];
        ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji, index) => {
            buttons.push(new ButtonBuilder()
                .setCustomId(emoji)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emoji)
                .setDisabled(index >= 2 ? currentPage === totalPages - 1 : currentPage === 0));
        });
        const newRow = new ActionRowBuilder().addComponents(buttons);
        // switch to the next embed
        console.log(`page`, currentPage);
        embeds[currentPage].setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });
        interaction.update({ embeds: [embeds[currentPage]], components: [newRow] });
    });
    collector.on('end', () => {
        const buttons = [];
        ['⏮️', '⬅️', '➡️', '⏭️'].forEach((emoji) => {
            buttons.push(new ButtonBuilder()
                .setCustomId(emoji)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emoji)
                .setDisabled(true));
        });
        const disabledRow = new ActionRowBuilder().addComponents(buttons);
        // disable the buttons after 60 seconds
        interaction.editReply({ components: [disabledRow] });
    });
};

const createEmbeds = (sortedLb, title, interaction) => {
    const embeds = [];
    if (sortedLb.length === 0) embeds.push(buildEmbed$1(title, interaction));

    for (let i = 0; i < sortedLb.length; i += config.maxEmbedFields) {
        const embedContent = [];
        const embed = buildEmbed$1(title, interaction);
        for (let index = i; index < Math.min(sortedLb.length, i + config.maxEmbedFields); index++) {
            const { name, wave, score, isFull, serverId, population, stash, playerTick } = sortedLb[index];
            embedContent.push({
                name: `**(${index}) ${name} (${serverId}), (${population}/32)${isFull ? "[FULL]" : ""}**`,
                value: `Wave: ${format(wave)}, Score - ${format(score)}` +
                    (playerTick ? `, \nX: ${playerTick.position.x.toFixed(0)}, Y: ${playerTick.position.y.toFixed(0)}, W: ${format(playerTick.wood)}, S: ${format(playerTick.stone)}, G: ${format(playerTick.gold)}` : "") +
                    (stash ? `,\nStash - X: ${stash.position.x.toFixed(0)}, Y: ${stash.position.y.toFixed(0)}` : ""),
            });
        }
        embed.addFields(embedContent);
        embeds.push(embed);
    }
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
    return { embeds, row };
};

const highestWave = async (interaction, options) => {
    const Leaderboard = filterLB('wave', options);
    const { embeds, row } = createEmbeds(Leaderboard, `Highest waves above wave ${options}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds, row);
};

const compact = (ms) => {
    return '0s';
};

const scanCommand = async (interaction, options) => {
    if (!LeaderBoard.has(options) && !servers[options]) {
        const failedEmbed = buildEmbed$1(`Invalid serverId, try again with a valid serverId.`, interaction, '#FF0000');
        return interaction.editReply({ embeds: [failedEmbed], ephemeral: true })
    } if (LeaderBoard.has(options)) {
        const embedContent = [];
        const server = LeaderBoard.get(options);
        const embed = buildEmbed$1(`${servers[options].name} (${options}) (${server.pop}/32)${server.isFull ? "[FULL]" : ""} & Uptime: ${server.serverAge} \nLastScanned: ${server.lastScanned ? compact(Date.now() - server.lastScanned) + " ago" : "Never."}`, interaction);
        server.lb.forEach((player, index) => {
            const { name, wave, uid, score, playerTick, stash } = player;
            embedContent.push({
                name: `(${index + 1}) [${uid}] ${name}`,
                value: `Wave: ${format(wave)}, Score: ${format(score)}` +
                    (playerTick ? `, \nX: ${playerTick.position.x.toFixed(0)}, Y: ${playerTick.position.y.toFixed(0)}, W: ${format(playerTick.wood)}, S: ${format(playerTick.stone)}, G: ${format(playerTick.gold)}` : "") +
                    (stash ? `,\nStash - X: ${stash.position.x.toFixed(0)}, Y: ${stash.position.y.toFixed(0)}` : ""),
            });
        });
        embed.addFields(embedContent);
        interaction.editReply({ embeds: [embed], ephemeral: config.ephemeral });
    } else if (!LeaderBoard.has(options) && servers[options]) {
        const failedEmbed = buildEmbed$1(`Server has not been scanned yet.`, interaction, '#FF0000');
        return interaction.editReply({ embeds: [failedEmbed], ephemeral: true })
    }
};

const findCommand = async (interaction, options) => {
    const Leaderboard = filterLB('name', options);
    const { embeds, row } = createEmbeds(Leaderboard, `Players with name ${options}, Results: ${Leaderboard.length}`, interaction);

    await sendEmbeds(interaction, embeds, row);
};

const fullCommand = async (interaction) => {
    const filledServers = [];
    LeaderBoard.forEach(server => {
        if (server.pop >= 32) {
            filledServers[server.id] = {
                name: `**[${server.id}] ${server.name}**`,
                value: `Population: ${server.pop}, Leaderboard ` + (server.lb.length !== 0 ? "available!" : "not available:sob:."),
            };
        }
    });
    // msg
    const filledServerEmbed = buildEmbed$1(`Filled servers list, Results: ${filledServers.length}`, interaction);
    filledServerEmbed.addFields(filledServers);
    interaction.editReply({ embeds: [filledServerEmbed], ephemeral: config.ephemeral });
};

const removeAlert = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0]?.value;

    if (!config.userAlerts[userId]) {
        const failedEmbed = buildEmbed$1("No alerts set.", interaction, '#FF0000');
        return interaction.editReply({ embeds: [failedEmbed], ephemeral: config.ephemeral })
    }
    if (!serverId && config.userAlerts[userId]) {
        config.userAlerts[userId] = {};

        const successEmbed = buildEmbed$1("All alert have been deleted.", interaction, '#88E788');
        interaction.editReply({ embeds: [successEmbed], ephemeral: config.ephemeral });
    }
    if (config.userAlerts[userId]) {
        if (config.userAlerts[userId][serverId]) {
            const successEmbed = buildEmbed$1(`Alert has been deleted for ${serverId}.`, interaction, '#88E788');
            interaction.editReply({ embeds: [successEmbed], ephemeral: config.ephemeral });

            delete config.userAlerts[userId][serverId];
        } else {
            const failedEmbed = buildEmbed$1("No alert set for that serverId.", interaction, '#FF0000');

            return interaction.editReply({ embeds: [failedEmbed], ephemeral: config.ephemeral })
        }
    }
};

const statsCommand = async (interaction) => {
    const statEmbed = buildEmbed$1(`Zombs server stats`, interaction);
    const serverPopulations = { full: 0, high: 0, medium: 0, low: 0, currentPopulation: 0, totalPopulation: Object.keys(servers).length * 32 };
    LeaderBoard.forEach(server => {
        server.pop < 10 && ++serverPopulations.low;
        server.pop == 32 && ++serverPopulations.full;
        serverPopulations.currentPopulation += server.pop;
        server.pop >= 20 && server.pop < 32 && ++serverPopulations.high;
        server.pop >= 10 && server.pop < 20 && ++serverPopulations.medium;
        // region stats
        const { region } = servers[server.id];
        !serverPopulations[region] && (serverPopulations[region] = {});
        serverPopulations[region].servers == undefined && (serverPopulations[region].servers = 0);
        serverPopulations[region].population == undefined && (serverPopulations[region].population = 0);
        // increment stats
        serverPopulations[region].servers++;
        serverPopulations[region].population += server.pop;
    });
    // msg
    const { full, high, medium, low, currentPopulation, totalPopulation } = serverPopulations;
    const fields = [{ name: `Server stats`, value: `Total population: ${totalPopulation},\nCurrent population: ${currentPopulation},\nFull servers: ${full},\nHigh servers: ${high},\nMedium servers: ${medium},\n Low servers: ${low}`, inline: true }];
    for (const region of ["US East", "Europe", "US West", "Asia", "Australia", "South America"]) {
        const similarServers = Object.values(servers).filter(e => e.region == region);
        fields.push({
            name: region,
            value: `Active servers: ${similarServers.length},\nTotal population: ${similarServers.length * 32},\nCurrent population: ${serverPopulations[region].population}`,
            inline: true
        });
    }
    statEmbed.addFields(fields);
    interaction.editReply({ embeds: [statEmbed] });
};

const alertCommand = (interaction, options) => {
    const userId = interaction.user.id;
    const serverId = options[0].value;
    const threshold = options[1].value;
    // if the input is invalid
    if (!servers[serverId]) {
        const failedEmbed = buildEmbed$1("Enter a valid serverId.", interaction, '#FF0000');
        return interaction.editReply({ embeds: [failedEmbed], ephemeral: config.ephemeral })
    }
    // if it is valid
    if (!config.userAlerts[userId]) config.userAlerts[userId] = {};
    if (Object.keys(config.userAlerts[userId]).length < 6) {
        if (threshold > 32 || threshold < 0) {
            const failedEmbed = buildEmbed$1("Enter a threshold value between 0 and 32.", interaction, '#FF0000');
            return interaction.editReply({ embeds: [failedEmbed], ephemeral: config.ephemeral })
        }
        config.userAlerts[userId][serverId] = {
            serverId: serverId,
            threshold: threshold,
            userId: userId,
            interaction: interaction,
        };
        const successEmbed = buildEmbed$1("Alert has been set successfully.", interaction, '#88E788');
        interaction.editReply({ embeds: [successEmbed], ephemeral: config.ephemeral });
    } else {
        const failedEmbed = buildEmbed$1("You have too many alerts already.", interaction, '#FF0000');
        interaction.editReply({ embeds: [failedEmbed], ephemeral: config.ephemeral });
    }
};

const highestScore = async (interaction, options) => {
    const LeaderBoard = filterLB('score', options);
    const { embeds, row } = createEmbeds(LeaderBoard, `Highest scores above score ${format(parseInt(options))}, Results: ${LeaderBoard.length}`, interaction);

    await sendEmbeds(interaction, embeds, row);
};

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

    //client.user.setAvatar('https://cdn.discordapp.com/avatars/1284523392850071636/ef5a9ed7c007f1671301bc3464dc4ab2.webp?size=512')
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
    await int.deferReply({ ephemeral: config.ephemeral }); // or false if you want a public response
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
            getStatus(int);
            break;
        case "stashes":
            getStashes(int, options[0]?.value);
            break;
        case "servers":
            serverStats(int);
            break;
    }
});

client.login(config.TOKEN);

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

export { client, clientUptime };
