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

function not_empty(args) {
    if (args.length) return args;
}

function parse_args(args) {
    try {
        if (args.length != (arguments.length - 1)) return;
        let r = [];
        for (let i = 0; i < args.length; i++){
            let x = arguments[i+1](args[i]);
            if (!x) return;
            r.push(x);
        }
        return r;
    } catch (e) {
        console.log(e);
    }
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

function validate(f, format) {
    return async (args) => {
        let formatted = format(args);
        if (!formatted) return;
        return await f.apply(null, formatted);
    }
}

Object.assign(module.exports, {
    range,
    map,
    not_empty,
    parse_args,
    map_num,
    validate,
});