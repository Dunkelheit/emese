'use strict';

var async = require('async');
var EventEmitter = require('events').EventEmitter;
var glob = require('glob');
var path = require('path');
var util = require('util');
var _ = require('lodash');

function log() {
    console.log.apply(this, arguments);
}

function debug(obj) {
    console.log(util.inspect(obj, { depth: null, colors: true }));
}

function iter(item, callback) {
    Object.keys(item).forEach(function (key) {
        if (typeof item[key] === 'object') {
            return iter(item[key], callback);
        } else {
            callback(item, key);
        }
    });
}

function Emese(api) {
    this.api = api || {};
    this.tasks = [];
}

util.inherits(Emese, EventEmitter);

Emese.prototype.resources = function (tree) {
    this.tree = tree;
    return this;
};

Emese.prototype.addTask = function (task) {
    this.tasks.push(task);
    return this;
};

Emese.prototype.load = function (done) {
    var self = this;
    var tasks = [];
    var cwd = process.cwd();
    iter(this.tree, function (item, key) {
        tasks.push(function (next) {
            glob(item[key], {}, function (err, files) {
                if (err) {
                    return next(err)
                }
                item[key] = {};
                files.forEach(function (file) {
                    var basename = path.basename(file, '.js');
                    item[key][basename] = require(path.join(cwd, file));
                    log('Loaded \'' + file + '\'');
                });
                next();
            });
        });
    });
    async.parallel(tasks, function (err) {
        if (err) {
            self.emit('error', err);
            if (done) {
                return done(err);
            }
        }
        _.extend(self.api, self.tree);
        self.emit('done', self.api);
        if (done) {
            done(null, self.api);
        }
    });
    return this;
};

var api = {
    version: '0.0.1'
};

var emese = new Emese(api);
emese
    .resources({
        client: {
            rest: 'test/client/rest/*.js',
            soap: 'test/client/soap/*.js'
        },
        common: 'test/common/*.js',
        plugin: 'test/plugin/*.js',
        service: 'test/service/*.js',
        transformer: 'test/transformer/*.js'
    })
    .load()
    .on('error', function (err) {
        console.log('ERROR!');
        console.log(err);
    })
    .on('done', function (api) {
        console.log(util.inspect(api, {colors: true, depth: null}));
    });

setTimeout(function () {
    debug(api);
}, 100);