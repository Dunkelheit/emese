var async = require('async');
var EventEmitter = require('events').EventEmitter;
var glob = require('glob');
var path = require('path');
var util = require('util');
var _ = require('lodash');

/**
 * Temporary logger function.
 */
function log() {
    console.log.apply(this, arguments);
}

/**
 * Variable debugger.
 *
 * @private
 * @param {*} obj - Variable to debug.
 */
function debug(obj) {
    console.log(util.inspect(obj, { depth: null, colors: true }));
}

/**
 * Convenience function to deeply iterate an object.
 *
 * @private
 * @param {object|string} item - The item to iterate.
 * @param {function} callback - The callback function.
 */
function iterate(item, callback) {
    Object.keys(item).forEach(function (key) {
        if (typeof item[key] === 'object') {
            return iterate(item[key], callback);
        } else {
            callback(item, key);
        }
    });
}

/**
 * The class constructor.
 *
 * @param {object} [api] - An optional API object.
 * @cosnstructor
 */
function Emese(api) {
    this.api = api || {};
    this.tasks = [];
}

util.inherits(Emese, EventEmitter);

/**
 * Adds a tree of resources. Your API will be extended with that same structure, with the resources being loaded as
 * values of the properties described.
 *
 * @todo Make the resources detect exports containing a propetry like "task" or "lifecycle" to automatically incorporate
 * it in the tasks
 * @example
 * var loader = new Emese();
 * loader.resources({
 *     client: {
 *         rest: 'test/client/rest/*.js',
 *         soap: 'test/client/soap/*.js'
 *     },
 *     common: 'test/common/*.js',
 *     plugin: 'test/plugin/*.js',
 *     service: 'test/service/*.js',
 *     transformer: 'test/transformer/*.js'
 * });
 * @param {object} resources - A resource tree.
 * @returns {Emese}
 */
Emese.prototype.resources = function (resources) {
    var self = this;
    this.tasks.push(function (next) {

        var resourceLoaders = [];
        var cwd = process.cwd();

        iterate(resources, function (item, key) {
            resourceLoaders.push(function (next) {
                glob(item[key], {}, function (err, files) {
                    if (err) {
                        return next(err);
                    }
                    item[key] = {};
                    files.forEach(function (file) {
                        var basename = path.basename(file, path.extname(file));
                        item[key][basename] = require(path.join(cwd, file));
                        log('Loaded \'' + file + '\'');
                    });
                    next();
                });
            });
        });

        async.parallel(resourceLoaders, function (err) {
            if (err) {
                return next(err);
            }
            // TODO: Replace extend with something else
            _.extend(self.api, resources);
            next();
        });

    });
    return this;
};

/**
 * Add one or more tasks to the loading process.
 *
 * @todo Make tasks objects with options like the function itself and a weight to sort them
 * @param {function|function[]} task - One or more tasks. The functions must have a callback as first argument.
 * @returns {Emese}
 */
Emese.prototype.addTask = function (task) {
    if (Array.isArray(task)) {
        this.tasks = this.tasks.concat(task);
    } else {
        this.tasks.push(task);
    }
    return this;
};

/**
 * Loads the app:
 * 1) Resources are loaded in parallel
 * 2) Tasks are executed sequentially
 *
 * @param {function} [done] - Optional callback function.
 * @fires Emese#done
 * @fires Emese#error
 * @returns {Emese}
 */
Emese.prototype.load = function (done) {
    var self = this;

    async.series(self.tasks, function (err) {
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

/**
 * An error event while loading.
 *
 * @event Emese#error
 * @type {Error}
 */

/**
 * Event fired when the API has been loaded.
 *
 * @event Emese#done
 * @type {object}
 */

var api = {
    version: '0.0.1',
    log: log
};

var loader = new Emese(api);

loader.resources({
    client: {
        rest: 'test/client/rest/*.js',
        soap: 'test/client/soap/*.js'
    },
    common: 'test/common/*.js',
    plugin: 'test/plugin/*.js',
    service: 'test/service/*.js',
    transformer: 'test/transformer/*.js'
});

loader.addTask([
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
        api.plugin.server.load(next);
    }
]);

loader.resources({
    public: 'test/public/**/*.json'
});


loader.load();

loader.on('error', function (err) {
    log('ERROR!');
    log(err);
});

loader.on('done', function (api) {
    log('Your application is ready to serve');
    debug(api);
});

module.exports = Emese;