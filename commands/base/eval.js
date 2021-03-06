const Discord = require("discord.js")
const child_process = require("child_process")
const util = require("util")

module.exports = (category, bot) => {
    category.addCommand("eval", function(msg, line) {
        let code = /^```\w*\n([\s\S]*)```$/gim.exec(line) // Test if we put a language after the code blocks first
        if (code && code[1]) {
            line = code[1]
        } else {
            code = /^```([\s\S]*)```$/gim.exec(line) // If not then treat everything inside as code
            if (code && code[1])
                line = code[1]
        }

        let embed = new Discord.MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())

        let res
        try {
            let print = msg.print
            res = eval(line)

            if (typeof res !== "string")
                res = util.inspect(res)

            embed.setColor(0xE2D655)
                .setTitle(":ballot_box_with_check: JavaScript result")
                .setDescription(`\`\`\`js\n${bot.truncate(res)}\n\`\`\``)
        } catch (err) {
            res = bot.formatErrorToDiscord(err)

            embed.setColor(0xE25555)
                .setTitle(":interrobang: JavaScript error")
                .setDescription(`${bot.truncate(res)}`)
        }


        msg.channel.send(embed)
    }, {
        help: "Executes JavaScript code and displays its result.",
        ownerOnly: true
    })

    /**
     * Runs a command in the running operating system's shell, and prints its results to the requesting channel.
     * @param {Discord.Message} msg The message that requested the command to be run.
     * @param {string} cmd The entire command line to be run.
     */
    function runCommand(msg, cmd) {
        return new Promise((resolve, reject) => {
            let proc = child_process.spawn(cmd, [], { shell: true })

            proc.stdout.on("data", msg.print)
            proc.stderr.on("data", msg.print)
            proc.on("close", () => {
                resolve()
            })
            proc.on("error", err => {
                reject(err)
            })
        })
    }

    category.addCommand("exec", async function(msg, line) {
        await runCommand(msg, line)
    }, {
        help: "Executes a command from the shell.",
        ownerOnly: true
    })
    category.addCommand("update", async function(msg, line) {
        msg.reply("updating...\n")
        await runCommand(msg, "git pull origin master")
    }, {
        help: "Updates the bot to the latest revision from its GitHub repository and quits it.",
        ownerOnly: true,
        postRun() {
            process.exit() // Restarting is handled by start.sh
        }
    })
}
