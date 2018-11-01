const tempus = require('tempus-api');
const utils = require('./utils');
const argparse = require('./argparse');


async function handle_swr(args) {
    var r = await tempus.mapWR(args, 's');
    return utils.format_run(args, 's', r.duration, r.player.name);
}

async function handle_dwr(args) {
    var r = await tempus.mapWR(args, 'd');
    return utils.format_run(args, 'd', r.duration, r.player.name);
}

async function handle_swrc(args) {
    let {map, num} = args;

    try {
        var r = await tempus.courseWR(map, num, 's');
        return utils.format_run(map, 's', r.duration, r.player.name, 0, 0, num);
    } catch (e) {
        return "Invalid Course Number";
    }
}

async function handle_dwrc(args) {
    let {map, num} = args;

    try {
        var r = await tempus.courseWR(map, num, 'd');
        return utils.format_run(map, 'd', r.duration, r.player.name, 0, 0, num);
    } catch (e) {
        return "Invalid Course Number";
    }
}

async function handle_swrb(args) {
    let {map, num} = args;

    try {
        var r = await tempus.bonusWR(map, num, 's');
        return utils.format_run(map, 's', r.duration, r.player.name, 0, num);
    } catch (e) {
        return "Invalid Bonus Number";
    }
}

async function handle_dwrb(args) {
    let {map, num} = args;

    try {
        var r = await tempus.bonusWR(map, num, 'd');
        return utils.format_run(map, 'd', r.duration, r.player.name, 0, num);
    } catch (e) {
        return "Invalid Bonus Number";
    }
}

async function handle_stime(args) {
    let {map, num} = args;

    try {
        var r = await tempus.mapTime(map, 's', num);
        return utils.format_run(map, 's', r.duration, r.player.name, num);
    } catch (e) {
        return "Invalid Run Number";
    }
}

async function handle_dtime(args) {
    let {map, num} = args;

    try {
        var r = await tempus.mapTime(map, 'd', num);
        return utils.format_run(map, 'd', r.duration, r.player.name, num);
    } catch (e) {
        return "Invalid Run Number";
    }
}

async function handle_p(args) {
    try {
        var r = await tempus.searchPlayer(args[0]);
        let player = await r.toPlayerStats();

        let msg = ("\n" + player.name + "\n" + 
            "Rank " + player.class_rank_info.soldier.rank + " Soldier :: " + player.class_rank_info.soldier.points + " Points\n" + 
            "Rank " + player.class_rank_info.demoman.rank + " Demoman :: " + player.class_rank_info.demoman.points + " Points\n"+
            (player.wr_stats.map ? ("Map WRs: " + player.wr_stats.map.count + "\n") : "") +
            (player.wr_stats.course ? ("Course WRs: " + player.wr_stats.course.count + "\n") : "") +
            (player.wr_stats.bonus ? ("Bonus WRs: " + player.wr_stats.bonus.count + "\n") : "") +
            (player.top_stats.map ? ("Map TTs: " + player.top_stats.map.count + "\n") : "") +
            (player.top_stats.course ? ("Course TTs: " + player.top_stats.course.count + "\n") : "") +
            (player.top_stats.bonus ? ("Bonus TTs: " + player.top_stats.bonus.count + "\n") : ""));
        return msg;
    } catch (e) {
        return "Invalid player";
    }
}


async function handle_message(message) {
    let content = message.content;
    var handler;
    handler = handlers[content.split(" ")[0]];
    if (handler != undefined) {
        let r = await handler(content.split(" ").slice(1, 9));
        if (!r) {
            utils.send(message, "Invalid arguments");
        } else {
            utils.send(message, r);
        }
    }
}

const handlers = {
    "!swr": argparse.validate(handle_swr, argparse.map()),
    "!dwr": argparse.validate(handle_dwr, argparse.map()),
    "!swrc": argparse.validate(handle_swrc, argparse.parse_map_num),
    "!dwrc": argparse.validate(handle_dwrc, argparse.parse_map_num),
    "!swrb": argparse.validate(handle_swrb, argparse.parse_map_num),
    "!dwrb": argparse.validate(handle_dwrb, argparse.parse_map_num),
    "!stime": argparse.validate(handle_stime, argparse.parse_map_num),
    "!dtime": argparse.validate(handle_dtime, argparse.parse_map_num),
    "!p": argparse.validate(handle_p, argparse.any()),
}

Object.assign(module.exports, {
    handle_message
});
