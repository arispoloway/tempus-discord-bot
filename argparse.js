const utils = require('./utils');

function range(min, max) {
    return (x) => {
        if (x >= min && x <= max) return x;
    }
}

function map() {
    return (m) => {
        let name = utils.parse_map_name(m);
        if (name) return name;
    }
}

function c() {
    return (c) => {
        if (c.toLowerCase() === 's') return 'soldier';
        if (c.toLowerCase() === 'd') return 'demoman';
    }
}

function any() {
    return (x) => x;
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

function parse_map_num(args) {
    let p = parse_args(args, map(), range(1, 9999));
    let p2 = parse_args(args, range(1, 9999), map());
    if (!p && !p2) {
        return undefined;
    }
    if (p) {
        return {map: p[0], num: p[1]}
    } else {
        return {map: p2[1], num: p2[0]}
    }
}

Object.assign(module.exports, {
    range,
    map,
    c,
    any,
    parse_args,
    parse_map_num,
});