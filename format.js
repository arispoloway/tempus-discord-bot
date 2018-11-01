

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

function format_player(player) {
    return ("\n" + player.name + "\n" + 
        "Rank " + player.class_rank_info.soldier.rank + " Soldier :: " + player.class_rank_info.soldier.points + " Points\n" + 
        "Rank " + player.class_rank_info.demoman.rank + " Demoman :: " + player.class_rank_info.demoman.points + " Points\n"+
        (player.wr_stats.map ? ("Map WRs: " + player.wr_stats.map.count + "\n") : "") +
        (player.wr_stats.course ? ("Course WRs: " + player.wr_stats.course.count + "\n") : "") +
        (player.wr_stats.bonus ? ("Bonus WRs: " + player.wr_stats.bonus.count + "\n") : "") +
        (player.top_stats.map ? ("Map TTs: " + player.top_stats.map.count + "\n") : "") +
        (player.top_stats.course ? ("Course TTs: " + player.top_stats.course.count + "\n") : "") +
        (player.top_stats.bonus ? ("Bonus TTs: " + player.top_stats.bonus.count + "\n") : ""));
}

function format_map(m) {
    return m.name + " :: S - T" + m.tiers.soldier + ", D - T" + m.tiers.demoman + " :: " + (m.authors.length == 1 ? m.authors[0].name : "Multiple Authors");
}

function format_server(s) {
    g = s.game_info;
    return g.currentMap + " (" + g.playerCount + "/" + g.maxPlayers + ")" + " | " + s.shortname + " | " + s.name + " [Connect](steam://connect/" + s.addr + ")";
}

function format_rank(name, rank, cl, points) {
    return "\n" + name + "\nRank " + rank + " " + cl + ":: " + points + " Points";
}

function format_run(map, c, t, name, rank, bonus, course) {
    return map + " " +
        (bonus ? "B" + String(bonus) + " " : "") +
        (course ? "C" + String(course) + " " : "") +
        "(" + ((c === 's') ? "S" : "D") + (rank && rank != 1 ? " #" + rank : " WR") + ") :: " + process_time(t) + " :: " + name;
}

function format_multi_record_listing(listing, list_time) {
    let mapped = listing.map((r) => (
        format_run(r.map.name, (r.class == 3 ? 's' : 'd'), r.duration, r.player.name, r.rank, r.zone_info.type=='bonus', r.zone_info.type=='course') +
        (list_time ? " :: " + process_time(new Date().getTime() / 1000 - r.date) + " ago" : ""))
    );
    return mapped.join("\n");
}

function format_servers(servers) {
    return servers.map(format_server).slice(0, 10).join("\n");
}

function format_error(err) {
    return err;
}


module.exports = {
    process_time,
    format_run,
    format_multi_record_listing,
    format_server,
    format_rank,
    format_player,
    format_map,
    format_servers,
    format_error,
}
