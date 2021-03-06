const utils = require('./utils');

function range(min, max) {
    return (x) => {
        if (x >= min && x <= max) return x;
    }
}

function map(args) {
    let name = utils.parse_map_name(args[0]);
    if (name) return [name];
}

function none(args) {
    if (!args.length) return [];
}

function not_empty(args) {
    if (args.length) return args;
}

function parse_args(args, ...format) {
    try {
        if (args.length != (format.length)) return;
        let r = [];
        for (let i = 0; i < args.length; i++){
            let x = format[i](args[i]);
            if (!x) return;
            r.push(x);
        }
        return r;
    } catch (e) {
        console.log(e);
    }
}

function monitor(args) {
    let map = utils.parse_map_name(args[0]);
    let c = utils.class_num(args[1]);
    let meta = args.slice(2).join("").toLowerCase();

    if (!map || !c) return;
    if (meta && !["c", "b"].includes(meta[0])) return;
    if (meta && parseInt(meta.slice(1)) === NaN) return;

    return [map, c, meta];
}

function map_num(args) {
    let p = parse_args(args, utils.parse_map_name, range(1, 9999));
    let p2 = parse_args(args, range(1, 9999), utils.parse_map_name);
    if (!p && !p2) {
        return undefined;
    }
    if (p) {
        return [p[0], p[1]];
    } else {
        return [p2[1], p2[0]];
    }
}

function player_or_num(args) {
    let p = parse_args(args, range(1, 99999));
    let p2 = parse_args(args, (x) => x);
    if (!p && !p2) {
        return undefined;
    }
    if (p) {
        return [undefined, p[0]];
    } else {
        return [p2[0], undefined];
    }
}

function validate(f, format) {
    return async (args, reply_function, channel) => {
        let formatted = format(args);
        if (!formatted) return;
        return await f.apply(null, formatted.concat([reply_function, channel]));
    }
}

Object.assign(module.exports, {
    range,
    map,
    not_empty,
    parse_args,
    map_num,
    player_or_num,
    validate,
    monitor,
    none,
});
