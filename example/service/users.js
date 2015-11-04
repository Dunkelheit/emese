'use strict';

var api = require('../api');

module.exports = {
    login: function () {
        return api.transformer.users.login();
    },
    logout: function () {
        return api.transformer.users.logout();
    },
    register: function () {
        return api.transformer.users.register();
    },
    getProfile: function () {
        return api.transformer.users.getProfile();
    },
    updateProfile: function () {
        return api.transformer.users.updateProfile();
    }
};