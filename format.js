const Discord = require('discord.js');
const utils = require('./utils');

const ERROR_COLOR = "RED";
const STANDARD_COLOR = "GREEN";

function format_profile(player) {
    return "[" + escape(player.name) + "](" + utils.profile_url(player) + ")";
}

function escape(text) {
    return text.replace("*", "\\*").replace("_", "\\_").replace("~", "\~");

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

function new_embed() {
    const embed = new Discord.RichEmbed();
    embed.setColor(STANDARD_COLOR);
    return embed;
}

function format_player(player) {
    const embed = new_embed();
    embed.setURL(utils.profile_url(player));
    embed.setTitle(player.name);
    var desc = "";
    desc += "Rank " + player.class_rank_info.soldier.rank + " Soldier - " + player.class_rank_info.soldier.points + " Points\n"
    desc += "Rank " + player.class_rank_info.demoman.rank + " Demoman - " + player.class_rank_info.demoman.points + " Points\n";
    if (player.wr_stats.map) desc += ("-", "Map WRs: " + player.wr_stats.map.count + "\n");
    if (player.wr_stats.course) desc += ("-", "Course WRs: " + player.wr_stats.course.count + "\n");
    if (player.wr_stats.bonus) desc += ("-", "Bonus WRs: " + player.wr_stats.bonus.count + "\n");
    if (player.top_stats.map) desc += ("-", "Map TTs: " + player.top_stats.map.count + "\n");
    if (player.top_stats.course) desc += ("-", "Course TTs: " + player.top_stats.course.count + "\n");
    if (player.top_stats.bonus) desc += ("-", "Bonus TTs: " + player.top_stats.bonus.count + "\n");
    embed.setDescription(desc);
    return embed;
}

function format_map(m) {
    const embed = new_embed();
    embed.setTitle(m.name + " | "+ (m.authors.length == 1 ? escape(m.authors[0].name) : "Multiple Authors"));
    var desc = "";
    desc += `Soldier - T${m.tiers.soldier}${(m.svid ? ` - [Video](${m.svid.getRealUrl()})\n` : "\n")}`;
    desc += `Demoman - T${m.tiers.soldier}${(m.dvid ? ` - [Video](${m.dvid.getRealUrl()})\n` : "\n")}`;
    embed.setDescription(desc);
    return embed;
}

function format_online(players) {
    players.sort((a, b) => {
        return a.rank_info.rank - b.rank_info.rank;
    });
    const embed = new_embed();
    embed.setTitle("Top Online Players");
    var desc = "";
    var count = players.length > 6 ? 6 : players.length;
    for (var i = 0; i < count; i++) {
        if (i != 0) { 
            desc += "\n";
        }
        p = players[i];
        s = p.server;
        g = s.game_info;
        desc += `Rank ${p.rank_info.rank} | [${escape(p.name)}](${utils.profile_url(p)}) on [${g.currentMap}](https://tempus.xyz/maps/${g.currentMap}) ([${s.shortname}](https://tempus.xyz/servers/${s.id}))`;
    }
    embed.setDescription(desc);
    return embed;
}

function format_server(s) {
    g = s.game_info;
    return escape(`${g.currentMap} (${g.playerCount}/${g.maxPlayers}) | ${s.shortname} | ${s.name} \nsteam://connect/${s.addr}`);
}

function format_servers(servers) {
    const embed = new_embed();
    embed.addField("Servers", servers.map(format_server).slice(0, 10).join("\n"), false);
    return embed;
}


function format_rank(player, rank, cl, points) {
    const embed = new_embed();
    embed.setTitle(player.name)
    embed.setURL(utils.profile_url(player));
    embed.setDescription(`Rank ${rank} ${cl} | ${points} Points`);
    return embed;
}

function run(map, c, t, player, rank, bonus, course) {
    return escape(map) + " " +
        (bonus ? "B" + String(bonus) + " " : "") +
        (course ? "C" + String(course) + " " : "") +
        "(" + ((c === 's') ? "S" : "D") + (rank && rank != 1 ? " #" + rank : " WR") + ") | " + process_time(t) + " | " + format_profile(player);
}

function format_run(map, c, t, player, rank, bonus, course) {
    const embed = new_embed();
    embed.setDescription(run(map, c, t, player, rank, bonus, course));
    return embed;
}

function format_demo(r, map, c, t, player, rank) {
    const embed = new_embed();
    if (r.deleted || r.expired) {
        embed.setColor(ERROR_COLOR);
        embed.setDescription("Demo not found");
        return embed;
    }
    embed.setTitle(r.demo_info.filename);
    embed.setURL(r.demo_info.url);

    let run_formatted = run(map, c, t, player, rank);
    let demo_formatted = "Ticks: " + r.demo_start_tick + " - " + r.demo_end_tick;
    embed.setDescription(run_formatted + "\n" + demo_formatted);
    return embed;

}

function format_multi_record_listing(title, listing, list_time) {
    const embed = new_embed();
    embed.setTitle(title);

    let mapped = listing.map((r) => (
        run(r.map.name, (r.class == 3 ? 's' : 'd'), r.duration, r.player, r.rank, 
        r.zone_info.type=='bonus' && r.zone_info.zoneindex, r.zone_info.type=='course' && r.zone_info.zoneindex) +
        (list_time ? " | " + process_time(new Date().getTime() / 1000 - r.date) + " ago" : ""))
    ).join("\n");
    embed.setDescription(mapped);
    return embed;
}

function format_error(err) {
    const embed = new_embed();
    embed.setColor(ERROR_COLOR);
    embed.setDescription(err);
    return embed;
}

function format_help() {
    const embed = new_embed();
    embed.setTitle("Tempus Bot Help");
    let records = `
        !swr <map> - Soldier map WR
        !dwr <map> - Demoman map WR
        !swrc <map|course> <course|map> - Soldier Course WR
        !dwrc <map|course> <course|map> - Demoman Course WR
        !swrb <map|bonus> <bonus|map> - Soldier Bonus WR
        !dwrb <map|bonus> <bonus|map> - Demoman Bonus WR
        !stime <map|num> <num|map> - Soldier Time <num> on <map>
        !dtime <map|num> <num|map> - Demoman Time <num> on <map>
        `
     let players = `
        !online - Online Players
        !p <name> - Player Stats
        !srank <name|num> - Player Soldier Rank
        !drank <name|num> - Player Demoman Rank
        !rank <name|num> - Player Overall Rank
    `;
    let demos = `
        !sdem <map> - Soldier WR .dem on <map>
        !ddem <map> - Demoman WR .dem on <map>
    `
    let rr = `
        !rr <page(optional)> - Recent Map WRs
        !rrc <page(optional)> - Recent Course WRs
        !rrb <page(optional)> - Recent Bonus WRs
        !rrtt <page(optional)> - Recent TTs
    `
    let maps = `
        !m <map> - Map Information
    `
    let servers = `
        !si <query> - Server Listing matching <query>
    `
    embed.addField("Records", records);
    embed.addField("Players", players);
    embed.addField("Demos", demos);
    embed.addField("Recent Records", rr);
    embed.addField("Maps", maps);
    embed.addField("Servers", servers);

    embed.setFooter("PM nolem#4220 with bugs/questions")
    return embed;
}

function format_wait() { 
    const embed = new_embed();
    embed.setTitle("Gathering information, please wait...");
    embed.setTimestamp(Date.now());
    return embed;
}


module.exports = {
    process_time,
    format_run,
    format_multi_record_listing,
    format_server,
    format_rank,
    format_player,
    format_map,
    format_online,
    format_servers,
    format_error,
    format_help,
    format_demo,
    format_wait,
}
