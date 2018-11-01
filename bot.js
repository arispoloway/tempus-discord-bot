const Discord = require('discord.js');
const Request = require('request');
const settings = require("./settings.js");
const tempus = require('tempus-api');
const handlers = require('./handlers');
const utils = require('./utils');


utils.update_maps();
update_interval = 1000 * 60 * 60 * 6 // every 6 hours
setInterval(utils.update_maps, update_interval);

const client = new Discord.Client();
client.on('ready', () => {
    console.log("Ready!");
});

client.on('message', handlers.handle_message);
client.login(settings.token);
