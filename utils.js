const tempus = require('tempus-api');
const SteamID = require('steamid');

let maps = [];

function profile_url(player) {
    return "http://steamcommunity.com/profiles/" + (new SteamID(player.steamid)).getSteamID64();
}

function parse_map_name(text, all_info=false) {
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].name.split("_")[1] === text) {
            if (!all_info) return maps[i].name;
            return maps[i];
        }
    }
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].name.includes(text)) {
            if (!all_info) return maps[i].name;
            return maps[i];
        }
    }
}

// format can be letter, lower, cap, upper, short
function parse_class(c, format) {
    if (['soldier', 's', 'solly'].indexOf(c.toLowerCase()) > -1) {
        if (format === 'letter') return 's';
        if (format === 'lower') return 'soldier';
        if (format === 'upper') return 'SOLDIER';
        if (format === 'cap') return 'Soldier';
        if (format === 'short') return 'solly';
    }
     if (['demoman', 'd', 'demo'].indexOf(c.toLowerCase()) > -1) {
        if (format === 'letter') return 'd';
        if (format === 'lower') return 'demoman';
        if (format === 'upper') return 'DEMOMAN';
        if (format === 'cap') return 'Demoman';
        if (format === 'short') return 'demo';
    }
}


async function update_maps() {
    maps = await tempus.detailedMapList();
}


Object.assign(module.exports, {
    update_maps,
    parse_map_name,
    parse_class,
    profile_url,
});
