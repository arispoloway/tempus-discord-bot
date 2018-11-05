const Discord = require('discord.js');
const settings = require("./settings.js");
const handlers = require('./handlers');
const utils = require('./utils');


utils.update_maps();
update_interval = 1000 * 60 * 60 * 6 // every 6 hours
setInterval(utils.update_maps, update_interval);

function discord_send(msg) {
    return (reply) => {
        msg.channel.send(reply);
    }
}

const client = new Discord.Client();

client.on('ready', () => {
    client.user.setActivity("Type !tempushelp for info", {type: "PLAYING"});
    console.log("Ready");
});

client.on('message', (x) => handlers.handle_message(discord_send(x), x.content));
client.login(settings.token);
