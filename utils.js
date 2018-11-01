const tempus = require('tempus-api');

var maps = [];

function send(msg, reply) {
    msg.reply('```' + reply + '```');
}

function process_time(t) {
    t = Number(t);
    var sec_num = parseInt(t, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if (hours === "00")
        return minutes + ":" + seconds;
    return hours + ':' + minutes + ':' + seconds;
}

function format_run(map, c, t, name, rank, bonus, course) {
    return map + " " +
        (bonus ? "B" + String(bonus) + " " : "") +
        (course ? "C" + String(course) + " " : "") +
        "(" + ((c === 's') ? "S" : "D") + (rank ? " #" + rank : " WR") + ") :: " + process_time(t) + " :: " + name;
}

function format_multi_record_listing(listing, list_time) {
    toreturn = "\n";
    listing.forEach(function (v, i, l) {
        toreturn += format_run(v['map_info']['name'], v['record_info']['class'], v['record_info']['duration'], v['player_info']['name'], ((v['rank'] === undefined) ? 1 : v['rank']),
            ((v['zone_info']['type'] == 'bonus') ? parseInt(v['zone_info']['zoneindex']) : 0),
            ((v['zone_info']['type'] == 'course') ? parseInt(v['zone_info']['zoneindex']) : 0)
        );
        if (list_time) {
            toreturn += " :: " + process_time(new Date().getTime() / 1000 - v['record_info']['date']) + " ago";
        }
        toreturn += "\n";
    });
    return toreturn;
}

function parse_map_name(text) {
    for (var i = 0; i < maps.length; i++) {
        if (maps[i].split("_")[1] === text) {
            return maps[i];
        }
    }
    for (var i = 0; i < maps.length; i++) {
        if (maps[i].includes(text)) {
            return maps[i];
        }
    }
}


async function update_maps() {
    let r = await tempus.detailedMapList();
    maps = r.map((x) => x.name);
}

Object.assign(module.exports, {
    send,
    process_time,
    format_run,
    format_multi_record_listing,
    update_maps,
    parse_map_name,
});