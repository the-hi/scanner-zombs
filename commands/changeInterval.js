import { config } from '../config.js'

const changeInterval = (int, options) => {
    if (int.user.id === config.OWNER_ID) {
        config.SCAN_INTERVAL = options;
        int.reply(`Scan interval changed to ${options / 1000} seconds.`)
    } else {
        int.reply(`Unauthorized user.`)
    }
}
export { changeInterval };