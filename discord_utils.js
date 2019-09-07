const settings = require("./settings.js");
const fs = require('fs');
const path = require('path');

function send_message(channel, message) {
    channel.send(message);
}

function discord_send(msg) {
    return (reply, previous = null) => {
        if (settings.logging) {
            fs.appendFile(path.resolve(__dirname, settings.logging), 
                          `${new Date().getTime()}` + 
                          `|${msg.author.username}|${msg.author.id}|${msg.content}|${msg.guild ? msg.guild.name : undefined}|${msg.channel.name}\n`,
                          () => {});
        }

        if (previous && !previous.deleted) { 
            if (previous.editable) return previous.edit(reply);
            if (previous.deletable) previous.delete();
        }
        return send_message(msg.channel, reply);
    };
}

Object.assign(module.exports, {
    discord_send,
    send_message,
});

