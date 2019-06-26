const tempus = require('tempus-api');
const utils = require('./utils');
const argparse = require('./argparse');
const format = require('./format');


function both_classes(f) {
    return [async (...args) => await f.apply(null, ['s'].concat(args)),
        async (...args) => await f.apply(null, ['d'].concat(args))]
}

async function wr(c, map) {
    var r = await tempus.mapWR(map, c);
    return format.format_run(map, c, r.duration, r.player);
}

async function wrc(c, map, num) {
    try {
        var r = await tempus.courseWR(map, num, c);
        return format.format_run(map, c, r.duration, r.player, 0, 0, num);
    } catch (e) {
        return format.format_error("Invalid Course Number");
    }
}

async function wrb(c, map, num) {
    try {
        var r = await tempus.bonusWR(map, num, c);
        return format.format_run(map, c, r.duration, r.player, 0, num);
    } catch (e) {
        return format.format_error("Invalid Bonus Number");
    }
}

async function time(c, map, num) {
    try {
        var r = await tempus.mapTime(map, c, num);
        return format.format_run(map, c, r.duration, r.player, num);
    } catch (e) {
        return format.format_error("Invalid Run Number");
    }
}

async function dem(c, map) {
    var r = await (await tempus.mapWR(map, c)).toRecordOverview();
    return format.format_demo(r, map, c, r.duration, r.player);
}

async function rank(c, player, num) {
    try {
        var search;
        if (player) {
            search = await tempus.searchPlayer(player);
        } else {
            search = await tempus.getRank(c, num);
        }
        let p = await search.toPlayerStats();
        var rank;
        var points;
        if (c === 's') {
            rank = p.class_rank_info.soldier.rank;
            points = p.class_rank_info.soldier.points;
        }
        if (c === 'd') {
            rank = p.class_rank_info.demoman.rank;
            points = p.class_rank_info.demoman.points;
        }
        if (c === 'o') {
            rank = p.rank_info.rank;
            points = p.rank_info.points;
        }

        var cl = utils.parse_class(c, "cap");
        cl = (cl ? cl + " " : "");

        return format.format_rank(p, rank, cl, points);
    } catch (e) {
        return format.format_error("Invalid argument");
    }
}

function reply_wait(f) {
    return async function slow_function(args, reply) {
        var msg = await reply(format.format_wait());
        var result = await f.apply(args);
        return [result, msg];
    };
}

async function rr(type, title, arg) {
    let parsed = parseInt(arg);
    var page = 1;
    let PAGE_STEP = 6;
    if (parsed){
        if (parsed <= 0 || parsed > 4) return format.format_error("Invalid page number");
        page = parsed;
    }
    let r = await tempus.getActivity();
    let records = r[type];
    return format.format_multi_record_listing(title, records.slice(PAGE_STEP*(page-1), PAGE_STEP*page), true)
}

let [handle_swr, handle_dwr] = both_classes(wr);
let [handle_swrc, handle_dwrc] = both_classes(wrc);
let [handle_swrb, handle_dwrb] = both_classes(wrb);
let [handle_stime, handle_dtime] = both_classes(time);
let [handle_sdem, handle_ddem] = both_classes(dem);
let [handle_srank, handle_drank] = both_classes(rank);

async function handle_online() {
    let servers = await tempus.serverList();
    let player_promises = servers
        .filter(s => s.game_info)
        .map(s => s.game_info.players
            .filter(p => p.id)
            .map(p => p.toPlayerStats().then(player => {
                    player.server = s;
                    return player;
                })
            )
        )
        .reduce((prev, next) => prev.concat(next));

    let players = await Promise.all(player_promises);
    if (players.length == 0) {
        return format.format_error("No players online");
    }
    return format.format_online(players);
}

async function handle_rank(player, num) {
    return await rank('o', player, num);
}

async function handle_p(p) {
    try {
        var r = await tempus.searchPlayer(p);
        let player = await r.toPlayerStats();

        return format.format_player(player);
    } catch (e) {
        return format.format_error("Invalid player");
    }
}

async function handle_rr(arg) {
    return await rr('map_wrs', "Recent Map WRs", arg);
}
async function handle_rrb(arg) {
    return await rr('bonus_wrs', "Recent Bonus WRs", arg);
}
async function handle_rrc(arg) {
    return await rr('course_wrs', "Recent Course WRs", arg);
}
async function handle_rrtt(arg) {
    return await rr('map_tops', "Recent TTs", arg);
}

async function handle_m(map) {
    let m = utils.parse_map_name(map, true);
    return format.format_map(m);
}

async function handle_si(args) {
    let query = args.join("");
    let servers = await tempus.serverList();
    let matching = servers.filter((s) => {
        if (!s.game_info) return false;
        return (s.country + s.shortname + s.name + s.game_info.currentMap + s.game_info.nextMap).toLowerCase().includes(query.toLowerCase())
    });
    if (matching.length == 0) return format.format_error("No matching servers");

    return format.format_servers(matching);
}

async function handle_help() {
    return format.format_help();
}


async function handle_message(reply, content) {
    var handler;
    handler = handlers[content.split(" ")[0]];
    if (handler != undefined) {
        try{
            let r = await handler(content.split(" ").slice(1, 9), reply);
            if (!r) {
                reply(format.format_error("Invalid arguments"));
            } else {
                // handlers wrapped with reply_wait() will return an array
                // containing the result as well as a temporary message for editing.
                reply(...typeof r[Symbol.iterator] == "function" ? r : [r]);
            }
        } catch (e) {
            reply(format.format_error("An error occurred"));
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
    "!sdem": argparse.validate(handle_sdem, argparse.map),
    "!ddem": argparse.validate(handle_ddem, argparse.map),
    "!online": reply_wait(handle_online),
    "!p": argparse.validate(handle_p, argparse.not_empty),
    "!srank": argparse.validate(handle_srank, argparse.player_or_num),
    "!drank": argparse.validate(handle_drank, argparse.player_or_num),
    "!rank": argparse.validate(handle_rank, argparse.player_or_num),
    "!rr": handle_rr,
    "!rrb": handle_rrb,
    "!rrc": handle_rrc,
    "!rrtt": handle_rrtt,
    "!m": argparse.validate(handle_m, argparse.map),
    "!si": handle_si,
    "!tempushelp": handle_help,
}

Object.assign(module.exports, {
    handle_message
});
