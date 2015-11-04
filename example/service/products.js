'use strict';

var api = require('../api');

module.exports = {
    search: function () {
        return api.transformer.products.transformProductList();
    },
    getDetails: function () {
        return api.transformer.products.transformProductDetails();
    }
};