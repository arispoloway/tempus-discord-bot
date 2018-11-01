const tempus = require('tempus-api');
const utils = require('./utils');
const argparse = require('./argparse');


async function handle_swr(map) {
    var r = await tempus.mapWR(map, 's');
    return utils.format_run(map, 's', r.duration, r.player.name);
}

async function handle_dwr(map) {
    var r = await tempus.mapWR(map, 'd');
    return utils.format_run(map, 'd', r.duration, r.player.name);
}

async function handle_swrc(map, num) {
    try {
        var r = await tempus.courseWR(map, num, 's');
        return utils.format_run(map, 's', r.duration, r.player.name, 0, 0, num);
    } catch (e) {
        return "Invalid Course Number";
    }
}

async function handle_dwrc(map, num) {
    try {
        var r = await tempus.courseWR(map, num, 'd');
        return utils.format_run(map, 'd', r.duration, r.player.name, 0, 0, num);
    } catch (e) {
        return "Invalid Course Number";
    }
}

async function handle_swrb(map, num) {
    try {
        var r = await tempus.bonusWR(map, num, 's');
        return utils.format_run(map, 's', r.duration, r.player.name, 0, num);
    } catch (e) {
        return "Invalid Bonus Number";
    }
}

async function handle_dwrb(map, num) {
    try {
        var r = await tempus.bonusWR(map, num, 'd');
        return utils.format_run(map, 'd', r.duration, r.player.name, 0, num);
    } catch (e) {
        return "Invalid Bonus Number";
    }
}

async function handle_stime(map, num) {
    try {
        var r = await tempus.mapTime(map, 's', num);
        return utils.format_run(map, 's', r.duration, r.player.name, num);
    } catch (e) {
        return "Invalid Run Number";
    }
}

async function handle_dtime(map, num) {
    try {
        var r = await tempus.mapTime(map, 'd', num);
        return utils.format_run(map, 'd', r.duration, r.player.name, num);
    } catch (e) {
        return "Invalid Run Number";
    }
}

async function handle_p(p) {
    try {
        var r = await tempus.searchPlayer(p);
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


async function handle_message(reply, content) {
    var handler;
    handler = handlers[content.split(" ")[0]];
    if (handler != undefined) {
        try{
            let r = await handler(content.split(" ").slice(1, 9));
            if (!r) {
                reply("Invalid arguments");
            } else {
                reply(r);
            }
        } catch (e) {
            reply("An error occurred");
        }
    }
}

const handlers = {
    "!swr": argparse.validate(handle_swr, argparse.map),
    "!dwr": argparse.validate(handle_dwr, argparse.map),
    "!swrc": argparse.validate(handle_swrc, argparse.map_num),
    "!dwrc": argparse.validate(handle_dwrc, argparse.map_num),
    "!swrb": argparse.validate(handle_swrb, argparse.map_num),
    "!dwrb": argparse.validate(handle_dwrb, argparse.map_num),
    "!stime": argparse.validate(handle_stime, argparse.map_num),
    "!dtime": argparse.validate(handle_dtime, argparse.map_num),
    "!p": argparse.validate(handle_p, argparse.not_empty),
}

Object.assign(module.exports, {
    handle_message
});
