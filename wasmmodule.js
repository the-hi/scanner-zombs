import fs from 'fs'
import { scanGame } from './scanner.js';


let wasmbuffers = [];
fs.readFile('./zombs_wasm.wasm', (err, data) => {
    wasmbuffers = data;

    scanGame();
})

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
    }
    var intToStr = function (int) {
        return intCalc(HEAPU8, int);
    }
    var repeater = function (int) {
        return 0 | cstr(intToStr(int));
    }
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
    }
    let cstr = (str) => {
        if (str.startsWith('typeof window === "undefined" ? 1 : 0')) return 0;
        if (str.startsWith("typeof process !== 'undefined' ? 1 : 0")) return 0;
        if (str.startsWith('Game.currentGame.network.connected ? 1 : 0')) return 1;
        if (str.startsWith('Game.currentGame.network.connectionOptions.ipAddress')) return Module.hostname;
        if (str.startsWith('Game.currentGame.world.myUid === null ? 0 : Game.currentGame.world.myUid')) return ((uid++) ? 0 : 696969);
        if (str.startsWith('document.getElementById("hud").children.length')) return 24;
    }
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
    }
    var methods = {
        'd': () => { },
        'f': () => { },
        'c': () => performance.now(),
        'e': () => { },
        'b': repeater,
        'a': importA
    }
    initializeInstance();
    var asmL = function () {
        return (asmL = exports.asm.l).apply(null, arguments);
    }
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
    }
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
    }
    Module.finalizeOpcode10 = blended => {
        const decoded = Module.decodeBlendInternal(blended);
        const list = new Uint8Array(decoded);
        const data = [10];
        for (let i = 0; i < decoded.byteLength; i++) {
            data.push(list[i]);
        }
        return new Uint8Array(data);
    }
    return Module;
}

export default wasmmodule;