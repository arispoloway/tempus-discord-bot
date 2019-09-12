const SQL = require('sql-template-strings');
const sqlite = require('sqlite');
const settings = require("./settings.js");

const dbPromise = sqlite.open(settings.table_file, { Promise });


async function initialize_tables() {
    const db = await dbPromise;
    await db.run("CREATE TABLE IF NOT EXISTS monitored_runs (map TEXT, class INT, meta TEXT, channel TEXT);");
    await db.run("CREATE INDEX IF NOT EXISTS monitored_runs_index ON monitored_runs(map, class, meta)");
    await db.run("CREATE INDEX IF NOT EXISTS monitored_runs_index ON monitored_runs(channel)");
}

async function monitor_run(map, c, meta, channel) {
    const db = await dbPromise;
    await db.run("INSERT INTO monitored_runs VALUES (?, ?, ?, ?)", [map, c, meta, channel]);
}

function parse_meta(run) {
    if (run.zone_info.type === 'bonus') return 'b' + run.zone_info.zoneindex;
    if (run.zone_info.type === 'course') return 'c' + run.zone_info.zoneindex;
}

async function matching_monitors(run, callback) {
    let query = SQL`SELECT * FROM monitored_runs WHERE map=${run.map.name} AND class=${run.class} `;

    const db = await dbPromise;
    const matching = await db.all(query);

    // null works weird for this, doing the where manually
    const meta = parse_meta(run);
    return matching.filter((row) => {
        if (!meta) return !(row.meta);
        return meta === row.meta;
    });
}

Object.assign(module.exports, {
    initialize_tables,
    monitor_run,
    matching_monitors,
});
