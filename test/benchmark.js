var Benchmark = require('benchmark');

var Emese = require('../lib/emese');

var suite = new Benchmark.Suite;

suite.add('Emese#resources', {
    defer: true,
    fn: function (deferred) {
        var loader = new Emese();
        loader.resources({
            transformer: 'example/transformer/products.js'
        });
        loader.on('done', function () {
            deferred.resolve();
        });
        loader.load();
    }
}).add('Emese#resourcesSync', {
    defer: true,
    fn: function (deferred) {
        var loader = new Emese();
        loader.resourcesSync({
            transformer: 'example/transformer/recipes.js'
        });
        loader.on('done', function () {
            deferred.resolve();
        });
        loader.load();
    }
});

module.exports = suite;