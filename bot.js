const Discord = require('discord.js');
const settings = require("./settings.js");
const handlers = require('./handlers');
const utils = require('./utils');
const discord_utils = require('./discord_utils.js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


utils.update_maps();
const update_interval = 1000 * 60 * 60 * 6; // every 6 hours
setInterval(utils.update_maps, update_interval);

const client = new Discord.Client();

client.on('ready', () => {
    client.user.setActivity("Type !tempushelp for info", {type: "PLAYING"});
    console.log("Ready");
});

client.on('message', (x) => handlers.handle_message(discord_utils.discord_send(x), x.content));
client.login(settings.token);
