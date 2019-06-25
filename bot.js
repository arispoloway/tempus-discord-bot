const Discord = require('discord.js');
const settings = require("./settings.js");
const handlers = require('./handlers');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


utils.update_maps();
update_interval = 1000 * 60 * 60 * 6 // every 6 hours
setInterval(utils.update_maps, update_interval);

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
            if (previous.deletable) return msg.channel.send.reply().then(previous.delete());
        }
        return msg.channel.send(reply);
    }
}

const client = new Discord.Client();

client.on('ready', () => {
    client.user.setActivity("Type !tempushelp for info", {type: "PLAYING"});
    console.log("Ready");
});

client.on('message', (x) => handlers.handle_message(discord_send(x), x.content));
client.login(settings.token);
