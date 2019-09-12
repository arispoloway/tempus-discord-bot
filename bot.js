const Discord = require('discord.js');
const settings = require("./settings.js");
const handlers = require('./handlers');
const utils = require('./utils');
const discord_utils = require('./discord_utils.js');
const monitor = require('./monitor.js');
const database = require('./database.js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


(async () => {
    utils.update_maps();
    const update_interval = 1000 * 60 * 60 * 6; // every 6 hours
    setInterval(utils.update_maps, update_interval);

    await database.initialize_tables();
    const monitor_refresh = 1000 * 60 * 5; // every 5 minutes
    setInterval(monitor.check_new_runs, monitor_refresh);


    const client = new Discord.Client();

    client.on('ready', () => {
        client.user.setActivity("Type !tempushelp for info", {type: "PLAYING"});
        console.log("Ready");

        discord_utils.register_client(client);
        monitor.check_new_runs();
    });

    client.on('message', (x) => handlers.handle_message(discord_utils.discord_send(x), x.content, x));
    client.login(settings.token);
})();

