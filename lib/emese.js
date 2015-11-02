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

function iterate(item, callback) {
    Object.keys(item).forEach(function (key) {
        if (typeof item[key] === 'object') {
            return iterate(item[key], callback);
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

Emese.prototype.resources = function (resources) {
    this.resources = resources;
    return this;
};

Emese.prototype.addTask = function (task) {
    if (_.isArray(task)) {
        this.tasks = this.tasks.concat(task);
    } else {
        this.tasks.push(task);
    }
    return this;
};

Emese.prototype.load = function (done) {
    var self = this;
    var resourceLoaders = [];
    var cwd = process.cwd();
    iterate(this.resources, function (item, key) {
        resourceLoaders.push(function (next) {
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

    async.series([
        function loadResources(next) {
            async.parallel(resourceLoaders, function (err) {
                if (err) {
                    return next(err);
                }

                _.extend(self.api, self.resources);
                next();
            });
        },
        function runTasks(next) {
            async.series(self.tasks, function (err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        }
    ], function (err) {
        if (err) {
            self.emit('error', err);
            return done && done(err);
        }
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
    .addTask([
        function (next) {
            log('Opening database connection');
            setTimeout(function () {
                log('Connected to the database');
                next();
            }, 150);
        },
        function (next) {
            log('Initializing cache');
            setTimeout(function () {
                log('Cache initialized');
                next();
            }, 200);
        },
        function (next) {
            log('Creating HTTP server');
            setTimeout(function () {
                log('HTTP server listening');
                next();
            }, 100);
        }
    ])
    .load()
    .on('error', function (err) {
        log('ERROR!');
        log(err);
    })
    .on('done', function (api) {
        log('Your application is ready to serve');
        debug(api);
    });

