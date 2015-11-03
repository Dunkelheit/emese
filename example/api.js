'use strict';

var util = require('util');
var Emese = require('../lib/emese');

var api = {
    version: '0.0.1',
    log: console.log,
    debug: function (obj) {
        api.log(util.inspect(obj, { depth: null, colors: true }));
    }
};

var loader = new Emese(api);

loader.resources({
    client: {
        _: 'example/client/*.js',
        service1: 'example/client/service1/*.js',
        service2: 'example/client/service2/*.js'
    },
    common: 'example/common/*.js',
    plugin: 'example/plugin/*.js',
    service: 'example/service/*.js',
    transformer: 'example/transformer/*.js'
});

loader.addTask([
    function (next) {
        api.log('Opening database connection');
        setTimeout(function () {
            api.log('Connected to the database');
            next();
        }, 150);
    },
    function (next) {
        api.log('Initializing cache');
        setTimeout(function () {
            api.log('Cache initialized');
            next();
        }, 200);
    },
    function (next) {
        api.plugin.server.load(next);
    }
]);

loader.resources({
    public: 'example/public/**/*.json'
});


loader.load();

loader.on('error', function (err) {
    api.log('ERROR!');
    api.log(err);
});

loader.on('done', function (api) {
    api.log('Your application is ready to serve');
    api.debug(api);
});