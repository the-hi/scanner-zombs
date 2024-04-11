import fetch from "node-fetch";

let wasmBuffers;

const wasmModule = () => {
    const Module = { repeater: 0 };

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

    const instantiate = (wasmbuffers) => {
        WebAssembly.instantiate(wasmbuffers, {
            "a": {
                'd': () => { },
                'f': () => { },
                'c': () => { },
                'e': () => { },
                'b': () => [0, 0, 1, 0, 24][(Module.repeater %= 5, Module.repeater++)],
                'a': () => (Module.HEAPU8.set(new Uint8Array([...new TextEncoder().encode(Module.hostname)])))
            }
        }).then(asm => {
            Module.asm = asm.instance.exports;
            Module.HEAPU8 = new Uint8Array(Module.asm.g.buffer);
            Module.asm.h();
            Module.asm.i(1, 140016);
            Module.ready = true;
            if (Module.opcode5Callback) Module.onDecodeOpcode5(Module.blended, Module.hostname, Module.opcode5Callback);
        });
    }

    !wasmBuffers ? fetch("https://cdn.glitch.global/14f404fe-81a3-418b-bc7c-78513660ae26/zombs_wasm%20(7).wasm?v=1710679251082").then(e => e.arrayBuffer().then(r => {
        wasmBuffers = r;
        instantiate(new Uint8Array(r));
    })) : instantiate(new Uint8Array(wasmBuffers))

    return Module;
};
export default wasmModule;