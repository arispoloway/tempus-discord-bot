const tempus = require('tempus-api');
const database = require('./database.js');
const format = require('./format.js');
const utils = require('./utils.js');
const discord_utils = require('./discord_utils.js');


let last_refresh;

async function monitor_run(map, c, meta, channel) {
    await database.monitor_run(map, c, meta, channel);
}

async function clear_channel(channel) {
    await database.clear_channel(channel);
}


async function message_monitor(run, monitor) {
    let bonus, course = 0;
    if (monitor.meta) {
        if (monitor.meta[0] === 'b') bonus = monitor.meta.slice(1);
        if (monitor.meta[0] === 'c') course = monitor.meta.slice(1);
    }
    const message = format.format_run(run.map.name, run.class, run.duration, run.player, 1, bonus, course);

    discord_utils.send_message(monitor.channel, message);
}


async function check_new_runs() {
    let r = await tempus.getActivity();

    const all_runs = ['map', 'bonus', 'course'].map((type) => {
        return r[type + '_wrs'];
    }).flat().flat();

    if (!last_refresh) {
        last_refresh = Math.max(...all_runs.map((r) => r.date));
    }

    const runs = all_runs.filter((run) => {
        return run.date > last_refresh;
    });


    await Promise.all(runs.map(async (run) => {
        const monitors = await database.matching_monitors(run);

        await Promise.all(monitors.map(async (monitor) => {
            await message_monitor(run, monitor);
        }));
    }));
}

Object.assign(module.exports, {
    check_new_runs,
    monitor_run,
    clear_channel,
});

