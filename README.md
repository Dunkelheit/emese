# emese

Emese aims to help you initialize and load large Node.js projects.

## Usage

```javascript
var api = {
    version: '0.0.1'
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
        log('Creating HTTP server');
        setTimeout(function () {
            log('HTTP server listening');
            next();
        }, 100);
    }
]);

loader.load();

loader.on('error', function (err) {
    log('ERROR!');
    log(err);
});

loader.on('done', function (api) {
    log('Your application is ready to serve');
    debug(api);
});
```