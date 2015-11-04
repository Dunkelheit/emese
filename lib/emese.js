'use strict';

var async = require('async');
var EventEmitter = require('events').EventEmitter;
var glob = require('glob');
var path = require('path');
var util = require('util');

var lang = require('./lang');

/**
 * The class constructor.
 *
 * @param {object} [api] - An optional API object.
 * @constructor
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
    var tree = lang.clone(resources);
    this.tasks.push(function (next) {

        var resourceLoaders = [];
        var cwd = process.cwd();

        lang.iterate(tree, function (item, key) {
            resourceLoaders.push(function (next) {
                glob(item[key], function (err, files) {
                    if (err) {
                        return next(err);
                    }
                    item[key] = {};
                    files.forEach(function (file) {
                        var filename = path.basename(file, path.extname(file));
                        if (key === '_') {
                            delete item[key]; // TODO: Improve this
                            item[filename] = require(path.join(cwd, file));
                        } else {
                            item[key][filename] = require(path.join(cwd, file));
                        }
                        self.emit('resourceLoaded', {
                            file: file
                        });
                    });
                    next();
                });
            });
        });

        async.series(resourceLoaders, function (err) {
            if (err) {
                return next(err);
            }
            lang.assign(self.api, tree);
            next();
        });

    });
    return this;
};

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
Emese.prototype.resourcesSync = function (resources) {
    var tree = lang.clone(resources);
    var cwd = process.cwd();

    lang.iterate(tree, function (item, key) {
        var globPath = item[key];
        var files = glob.sync(globPath);
        item[key] = {};
        files.forEach(function (file) {
            var filename = path.basename(file, path.extname(file));
            if (key === '_') {
                delete item[key];
                item[filename] = require(path.join(cwd, file));
            } else {
                item[key][filename] = require(path.join(cwd, file));
            }
            self.emit('resourceLoaded', {
                file: file
            });
        });
    });

    lang.assign(this.api, tree);

    return this;
};

/**
 * Add one or more tasks to the loading process.
 *
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
 * @fires Emese#resourceLoaded
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

/**
 * Event fired when a resource has been loaded.
 *
 * @event Emese#resourceLoaded
 * @type {object}
 * @property {string} file - The path of the resource that was loaded.
 */

module.exports = Emese;