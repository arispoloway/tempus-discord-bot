const settings = require("./settings.js");
const fs = require('fs');
const path = require('path');

let client;

function register_client(c) {
    if (!client) client = c;
}

function send_message(channel, message) {
    let target = client.channels.get(channel);
    if (!target) target = client.users.get(channel);
    if (!target) return;
    target.send(message);
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
        return msg.channel.send(reply);
    };
}

Object.assign(module.exports, {
    discord_send,
    send_message,
    register_client,
});

