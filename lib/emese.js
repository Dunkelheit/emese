'use strict';

var async = require('async');
var glob = require('glob');
var path = require('path');
var util = require('util');

function iter(item, callback) {
    Object.keys(item).forEach(function (key) {
        if (typeof item[key] === 'object') {
            return iter(item[key], callback);
        } else {
            callback(item, key);
        }
    });
}

var emese = {
    load: function (tree, done) {
        var tasks = [];
        iter(tree, function (item, key) {
            tasks.push(function (next) {
                glob(item[key], {}, function (err, files) {
                    if (err) {
                        return next(err)
                    }
                    item[key] = {};
                    files.forEach(function (file) {
                        var basename = path.basename(file, '.js');
                        item[key][basename] = require(path.join(process.cwd(), file));
                    });
                    next();
                });
            });
        });
        async.parallel(tasks, function (err) {
            if (err) {
                return done(err);
            }
            done(null, tree);
        });
    }
};

emese.load({
    client: {
        rest: 'test/client/rest/*.js',
        soap: 'test/client/soap/*.js'
    },
    common: 'test/common/*.js',
    plugin: 'test/plugin/*.js',
    service: 'test/service/*.js',
    transformer: 'test/transformer/*.js'
}, function (err, api) {
    if (err) {
        console.log('ERROR!');
        console.log(err);
    }
    console.log(util.inspect(api, {colors: true, depth: null}));
});

