'use strict';

module.exports = {
    serve: function (done) {
        //console.log('Creating HTTP server');
        setTimeout(function () {
            //console.log('HTTP server listening');
            done();
        }, 100);
    }
};