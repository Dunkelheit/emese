'use strict';

var api = require('../api');

module.exports = {
    search: function () {
        return api.transformer.recipes.transformRecipeList();
    },
    getDetails: function () {
        return api.transformer.recipes.transformRecipeDetails();
    }
};