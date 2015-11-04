'use strict';

var api = require('../api');

module.exports = {
    search: function () {
        return api.transformer.stores.transformStoreList();
    },
    getDetails: function () {
        return api.transformer.stores.transformStoreDetails();
    }
};