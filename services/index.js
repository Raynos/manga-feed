'use strict';

var UserService = require('./user/');

module.exports = createServices;

function createServices(clients) {
    return {
        user: UserService(clients)
    };
}
