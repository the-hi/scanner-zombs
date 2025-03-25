import { Jimp } from 'jimp';
import fetch from "node-fetch";
import { AttachmentBuilder } from 'discord.js';

const createMap = async (serverId, interaction) => {
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
    interaction.reply({ files: [attachment] })
}

let serverSpots;

const filterText = (text) => {
    let index = text.indexOf("window.serverspots = {");
    if (index < 0) return null;

    let braces = 1
    let end = index + "window.serverspots = {".length;
    while (braces > 0 && end < text.length) {
        if (text[end] === '{') braces++;
        else if (text[end] === '}') braces--;
        end++;
    }
    const newText = text.substring("window.serverspots = ".length, end)
    return braces === 0 ? newText.replaceAll("v", `"v`).replaceAll(": {", `": {`).replaceAll("spotEncoded", `"spotEncoded"`).replaceAll("'", `"`).replaceAll("spotinfo", `"spotinfo"`) : null;
}

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
}

const getRealPosOfIndex = (index) => {
    return {
        x: ((((index * 100).toFixed(2) - "") % 5000000) | 0) / 100,
        y: (index / 50000 | 0) / 100
    }
}

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
}

fetch("https://zombs-server-spots.glitch.me/serverspots.js").then(e => e.text()).then(e => {
    const spotsJSON = JSON.parse(filterText(e));
    for (const server in spotsJSON) {
        spotsJSON[server].spots = decodeSpotJSON(spotsJSON[server].spotEncoded);
        delete spotsJSON[server].spotEncoded;
    }
    serverSpots = spotsJSON;
    console.log('Server spots loaded.')
})

export { createMap };