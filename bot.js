const Discord = require('discord.js')
const Request = require('request')
const Cheerio = require('cheerio')
const Steam   = require('steam-server-status')
const settings = require("./settings.js")

const client = new Discord.Client();






const base_url = "https://tempus.xyz"
const map_list_endpoint = "/api/maps/detailedList"
const map_times_endpoint_prefix = "/api/maps/name/"
const map_times_endpoint_suffix = "/zones/typeindex/map/1/records/list"
const course_times_endpoint_suffix1 = "/zones/typeindex/course/"
const bonus_times_endpoint_suffix1  = "/zones/typeindex/bonus/"
const bonus_times_endpoint_suffix2 = "/records/list"
const course_times_endpoint_suffix2 = "/records/list"
const recent_record_endpoint = "/api/activity"
const player_map_search_endpoint = "/api/search/playersAndMaps/"
const player_info_endpoint = "/api/players/id/"
const class_rank_endpoint = "/api/ranks/class/"

client.on('ready', () => {
        console.log("Ready!");
})

client.on('message', message => {
        var content = message.content;
        var handler;
        handler = handlers[content.split(" ")[0]]
        if(handler != undefined){
             handler(message, content.split(" ").slice(1,9));
        } 
});

var process_time = function(t){
        t = Number(t);
        var sec_num = parseInt(t, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        if (hours === "00")
                return minutes+":"+seconds;
        return hours+':'+minutes+':'+seconds;
}

var format_run = function(map, c, t, name, rank, bonus, course){
        return map + " " + 
                ((bonus != 0) ? "B" + String(bonus) + " " : "") + 
                ((course != 0) ? "C" + String(course) + " ": "") + 
                "("+((c === 3) ? "S" : "D") + ((rank===1) ? " WR" : " #" + rank) + ") :: " +  process_time(t) + " :: " + name;
}

var handle_rrb = function(message, args){
        handle_rr(message, ["b"]);
}

var handle_rrtt = function(message, args){
        handle_rr(message, ["tt"]);
}

var handle_rrc = function(message, args){
        handle_rr(message, ["c"]);
}
var handle_rr = function(message, args){
        var type = "map_wrs";
        if(args[0] === "bonus" || args[0] === "b"){
                type = "bonus_wrs";
        }else if (args[0] === "course" || args[0] === "c"){
                type = "course_wrs";
        }else if (args[0] == "tt"){
                type = "map_tops";
        }
        Request(make_options(recent_record_endpoint), function(error, response, html){
                r = JSON.parse(html);
                listing = r[type];
                message.reply(format_multi_record_listing(listing.slice(0, 6), true));
        });
}

var handle_mi = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        message.reply(map['name'] + " :: S - T" + map['tier_info']['3'] + ", D - T" + map['tier_info']['4'] + " :: " + ((map['authors'].length == 1) ? map['authors'][0]['name'] : "Multiple Authors"))
}

var format_multi_record_listing = function(listing, list_time ){
        toreturn = "\n";
        listing.forEach(function(v, i, l){
            toreturn += format_run(v['map_info']['name'], v['record_info']['class'], v['record_info']['duration'], v['player_info']['name'], ((v['rank'] === undefined) ? 1 : v['rank']),
                ((v['zone_info']['type'] == 'bonus') ?  parseInt(v['zone_info']['zoneindex']) : 0),
                ((v['zone_info']['type'] == 'course') ?  parseInt(v['zone_info']['zoneindex']) : 0) 
            );
            if(list_time){
                toreturn += " :: " + process_time(new Date().getTime() / 1000 - v['record_info']['date']) + " ago";
            }
            toreturn += "\n";
        }); 
        return toreturn;
}


var handle_srank = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        if (parseInt(args[0]) == args[0] && parseInt(args[0]) < 50){
                var rank = parseInt(args[0]);
                Request(make_options(class_rank_endpoint + 3), function(error,response,html){
                        players = JSON.parse(html)['players'];
                        player = players[rank-1];
                        message.reply(player['name'] + " with " + player['points'] + " points");

                });
            
        }else{
                Request(make_options(player_map_search_endpoint + args.join(" ")), function(error, response, html){
                        players = JSON.parse(html)['players']
                        if(players.length == 0){
                                message.reply("No players found");
                                return;
                        }
                        Request(make_options(player_info_endpoint + players[0]['id'] + "/stats"), function(error, response, html){
                                player = JSON.parse(html);
                                message.reply(player['player_info']['name'] + "\n" + 
                                        "Rank " + player['class_rank_info']['3']['rank'] + " Soldier :: " + player['class_rank_info']['3']['points'] + " Points\n"
                                    )
                        })
                });
        }
}


var handle_drank = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        if (parseInt(args[0]) == args[0] && parseInt(args[0]) < 50){
                var rank = parseInt(args[0]);
                Request(make_options(class_rank_endpoint + 4), function(error,response,html){
                        players = JSON.parse(html)['players'];
                        player = players[rank-1];
                        message.reply(player['name'] + " with " + player['points'] + " points");

                });
            
        }else{
                Request(make_options(player_map_search_endpoint + args.join(" ")), function(error, response, html){
                        players = JSON.parse(html)['players']
                        if(players.length == 0){
                                message.reply("No players found");
                                return;
                        }
                        Request(make_options(player_info_endpoint + players[0]['id'] + "/stats"), function(error, response, html){
                                player = JSON.parse(html);
                                message.reply(player['player_info']['name'] + "\n" + 
                                        "Rank " + player['class_rank_info']['4']['rank'] + " Demoman :: " + player['class_rank_info']['4']['points'] + " Points\n"
                                    )
                        })
                });
        }
}

var handle_p = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        Request(make_options(player_map_search_endpoint + args.join(" ")), function(error, response, html){
                players = JSON.parse(html)['players']
                if(players.length == 0){
                        message.reply("No players found");
                        return;
                }
                Request(make_options(player_info_endpoint + players[0]['id'] + "/stats"), function(error, response, html){
                        player = JSON.parse(html);
                        message.reply(player['player_info']['name'] + "\n" + 
                                "Rank " + player['class_rank_info']['3']['rank'] + " Soldier :: " + player['class_rank_info']['3']['points'] + " Points\n" + 
                                "Rank " + player['class_rank_info']['4']['rank'] + " Demoman :: " + player['class_rank_info']['4']['points'] + " Points\n"+
                                ((player['wr_stats']['map'] != undefined && player['wr_stats']['map']['count'] != undefined) ? ("Map WRs: " + player['wr_stats']['map']['count'] + "\n") : "") +
                                ((player['wr_stats']['course'] != undefined && player['wr_stats']['course']['count'] != undefined) ? ("Course WRs: " + player['wr_stats']['course']['count'] + "\n") : "") +
                                ((player['wr_stats']['bonus'] != undefined && player['wr_stats']['bonus']['count'] != undefined) ? ("Bonus WRs: " + player['wr_stats']['bonus']['count'] + "\n") : "") +
                                ((player['top_stats']['map'] != undefined && player['top_stats']['map']['count'] != undefined) ? ("Map TTs: " + player['top_stats']['map']['count'] + "\n") : "") +
                                ((player['top_stats']['course'] != undefined && player['top_stats']['course']['count'] != undefined) ? ("Course TTs: " + player['top_stats']['course']['count'] + "\n") : "") +
                                ((player['top_stats']['bonus'] != undefined && player['top_stats']['bonus']['count'] != undefined) ? ("Bonus TTs: " + player['top_stats']['bonus']['count'] + "\n") : "") 
                            )


                })
        })
}

var handle_stime = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        time = parseInt(args[1]);
        if(time == NaN || time > 10 || time < 1){
                message.reply("Invalid run number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + map_times_endpoint_suffix), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['soldier'][time-1] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 3, r['results']['soldier'][time-1]['duration'], r['results']['soldier'][time-1]['name'], time, 0, 0));
        });
}
var handle_dtime = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        time = parseInt(args[1]);
        if(time == NaN || time > 10 || time < 1){
                message.reply("Invalid run number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + map_times_endpoint_suffix), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['demoman'][time-1] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 4, r['results']['demoman'][time-1]['duration'], r['results']['demoman'][time-1]['name'], time, 0, 0));
        });
}
var handle_dwr = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + map_times_endpoint_suffix), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['demoman'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 4, r['results']['demoman'][0]['duration'], r['results']['demoman'][0]['name'], 1, 0, 0));
        });
}


var handle_swr = function(message, args){
        if(args.length == 0){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + map_times_endpoint_suffix), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['soldier'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 3,  r['results']['soldier'][0]['duration'], r['results']['soldier'][0]['name'], 1, 0, 0));
        });
}

var handle_swrb = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        bonus_num = parseInt(args[1]);
        if(isNaN(bonus_num) || !(bonus_num <= map['zone_counts']['bonus'])){
                message.reply("Invalid bonus number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + bonus_times_endpoint_suffix1 + args[1] + bonus_times_endpoint_suffix2), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['soldier'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 3,  r['results']['soldier'][0]['duration'], r['results']['soldier'][0]['name'], 1, bonus_num, 0));
        });
}

var handle_dwrb = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        bonus_num = parseInt(args[1]);
        if(isNaN(bonus_num) || !(bonus_num <= map['zone_counts']['bonus'])){
                message.reply("Invalid bonus number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + bonus_times_endpoint_suffix1 + args[1] + bonus_times_endpoint_suffix2), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['demoman'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 4,  r['results']['demoman'][0]['duration'], r['results']['demoman'][0]['name'], 1, bonus_num, 0));
        });
}

var handle_swrc = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        course_num = parseInt(args[1]);
        if(isNaN(course_num) || !(course_num <= map['zone_counts']['course'])){
                message.reply("Invalid course number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + course_times_endpoint_suffix1 + args[1] + course_times_endpoint_suffix2), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['soldier'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 3,  r['results']['soldier'][0]['duration'], r['results']['soldier'][0]['name'], 1, 0, course_num));
        });
}

var handle_dwrc = function(message, args){
        if(args.length < 2){
                message.reply("Not enough arguments");
                return
        }
        map = parse_map_name(args[0])
        if(map == undefined){
                message.reply("Invalid map name");
                return
        }
        course_num = parseInt(args[1]);
        if(isNaN(course_num) || !(course_num <= map['zone_counts']['course'])){
                message.reply("Invalid course number");
                return
        }
        Request(make_options(map_times_endpoint_prefix + map['name'] + course_times_endpoint_suffix1 + args[1] + course_times_endpoint_suffix2), function(error, response, html){
                r = JSON.parse(html);
                if(r['results']['demoman'][0] === undefined){
                        message.reply("No runs");
                        return;
                }
                message.reply(format_run(map['name'], 4,  r['results']['demoman'][0]['duration'], r['results']['demoman'][0]['name'], 1, 0, course_num));
        });
}

var parse_map_name = function(text){
        for(var i = 0; i < maps.length; i++){
                if(maps[i]['name'].split("_")[1] === text){
                        return maps[i];
                }
        }
        for(var i = 0; i < maps.length; i++){
                if(maps[i]['name'].includes(text)){
                        return maps[i];
                }
        }
}

var parse_server_name = function(text){
        for(var i = 0; i < settings.servers.length; i++){
                if(settings.servers[i].names.includes(text)){
                        return settings.servers[i]
                }
        }
}
var parse_server_group = function(text){
        for(var i = 0; i < settings.server_groups.length; i++){
                if(settings.server_groups[i].name === text){
                        var servers = []
                        for(var j = 0; j < settings.server_groups[i].servers.length; j++){
                                servers.push(parse_server_name(settings.server_groups[i].servers[j]));
                        }
                        return servers;
                }
        }
}


var handle_server_status = function(message, args){
        if(args.length == 0){
                message.reply("Invalid args");
                return
        }         
        args.forEach(function(element){
                var server = parse_server_name(element);
                if(!server){
                        servers = parse_server_group(element);
                        if(!servers){
                                return
                        }
                }else{
                        servers = [server]
                }
                servers.forEach(function(server){
                        Steam.getServerStatus(server.ip, server.port, function(r){
                                if(r.error){
                                        console.error(r.error);
                                        message.reply("An error occurred");
                                }else{
                                        message.reply(r.map + " | " + r.serverName + " " + r.connectUrl);
                                } 
                        });

                });

        });
        
}

var update_maps = function(){
    Request(make_options(map_list_endpoint), function(error, response, html){
        maps = JSON.parse(html);
        console.log("Maps updated");
    });
}

var handlers = {
        "!swr":handle_swr,
        "!dwr":handle_dwr,
        "!swrb":handle_swrb,
        "!dwrb":handle_dwrb,
        "!swrc":handle_swrc,
        "!dwrc":handle_dwrc,
        "!rr":handle_rr,
        "!rrb":handle_rrb,
        "!rrc":handle_rrc,
        "!rrtt":handle_rrtt,
        "!m":handle_mi,
        "!p":handle_p,
        "!srank":handle_srank,
        "!drank":handle_drank,
        "!stime":handle_stime,
        "!dtime":handle_dtime,
        "!updatemaps":update_maps,
        "!si":handle_server_status
}



var maps = []

var make_options = function(endpoint){
        return {url:base_url+endpoint, method:'GET', headers:{'Accept':'application/json'}}
}


update_maps();

update_interval = 1000 * 60 * 60 * 6 // every 6 hours
setInterval(update_maps, update_interval);

client.login(settings.token);
