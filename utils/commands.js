import fs from "node:fs";

const commands = new Map();
const files = fs.readdirSync("./commands");

const loadCommand = async () => {
    for (const fileName of files) {
        const file = await import(`../commands/${fileName}`);

        const module = Object.values(file)[0];
        const moduleName = Object.keys(file)[0];

        commands.set(moduleName, module);
    }
}

loadCommand();

export { commands };