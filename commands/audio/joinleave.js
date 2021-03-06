const logger = require("../../logging.js")

module.exports = (category, bot) => {
    category.addCommand("join", async function(msg, line, ...args) {
        if (!msg.member) { msg.reply("webhooks unsupported."); return }

        let vc = msg.guild.me.voiceChannel

        if (!vc) {
            vc = msg.member.voiceChannel

            if (vc) {
                await vc.join()
            } else {
                msg.reply("you aren't in any channel.")
            }
        } else {
            if (!vc.connection) {
                logger.warn("discord-voice", "No connection? What.")
                await vc.leave()
                await vc.join()
            }
        }

        return vc
    }, {
        guildOnly: true,
        help: "Makes the bot join the voice channel you are currently in."
    })

    category.addCommand("leave", function(msg, line) {
        let vc = msg.guild.me.voiceChannel

        if (vc) {
            vc.leave()
        } else {
            msg.reply("I am not in any channel.")
        }
    }, {
        guildOnly: true,
        help: "Makes the bot leave the voice channel it's in."
    })
}
