'use strict';

module.exports = {
    get: function () {
        return {};
    },
    set: function () {
        return {};
    },
    connect: function (done) {
        //console.log('Connecting to cache');
        setTimeout(function () {
            //console.log('Connected to cache');
            done();
        }, 80);
    }
};