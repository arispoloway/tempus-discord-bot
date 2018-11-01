const tempus = require('tempus-api');
const utils = require('./utils');
const argparse = require('./argparse');


async function handle_swr(message, args) {
    let parsed = argparse.parse_args(args, argparse.map());
    if (!parsed) {
        utils.send(message, "Invalid arguments");
        return;
    }

    var r = await tempus.mapWR(parsed[0], 's');
    utils.send(message, utils.format_run(parsed[0], 's', r.duration, r.player.name));
}

async function handle_dwr(message, args) {
    let parsed = argparse.parse_args(args, argparse.map());
    if (!parsed) {
        utils.send(message, "Invalid arguments");
        return;
    }

    var r = await tempus.mapWR(parsed[0], 'd');
    utils.send(message, utils.format_run(parsed[0], 'd', r.duration, r.player.name));
}

async function handle_swrc(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.courseWR(map, num, 's');
        utils.send(message, utils.format_run(map, 's', r.duration, r.player.name, 0, 0, num));
    } catch (e) {
        utils.send(message, "Invalid Course Number");
    }
}

async function handle_dwrc(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.courseWR(map, num, 'd');
        utils.send(message, utils.format_run(map, 'd', r.duration, r.player.name, 0, 0, num));
    } catch (e) {
        utils.send(message, "Invalid Course Number");
    }
}

async function handle_swrb(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.bonusWR(map, num, 's');
        utils.send(message, utils.format_run(map, 's', r.duration, r.player.name, 0, num));
    } catch (e) {
        utils.send(message, "Invalid Bonus Number");
    }
}

async function handle_dwrb(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.bonusWR(map, num, 'd');
        utils.send(message, utils.format_run(map, 'd', r.duration, r.player.name, 0, num));
    } catch (e) {
        utils.send(message, "Invalid Bonus Number");
    }
}

async function handle_stime(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.mapTime(map, 's', num);
        utils.send(message, utils.format_run(map, 's', r.duration, r.player.name, num));
    } catch (e) {
        utils.send(message, "Invalid Run Number");
    }
}

async function handle_dtime(message, args) {
    let p = argparse.parse_map_num(args);
    if (!p) {
        utils.send(message, "Invalid arguments");
        return;
    }
    let {map, num} = p;

    try {
        var r = await tempus.mapTime(map, 'd', num);
        utils.send(message, utils.format_run(map, 'd', r.duration, r.player.name, num));
    } catch (e) {
        utils.send(message, "Invalid Run Number");
    }
}


async function handle_message(message) {
    let content = message.content;
    var handler;
    handler = handlers[content.split(" ")[0]];
    if (handler != undefined) {
        handler(message, content.split(" ").slice(1, 9));
    }
}

const handlers = {
    "!swr": handle_swr,
    "!dwr": handle_dwr,
    "!swrc": handle_swrc,
    "!dwrc": handle_dwrc,
    "!swrb": handle_swrb,
    "!dwrb": handle_dwrb,
    "!stime": handle_stime,
    "!dtime": handle_dtime,
}

Object.assign(module.exports, {
    handle_message
});