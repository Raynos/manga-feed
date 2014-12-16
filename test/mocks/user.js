'use strict';

var UserService = require('../../services/user/');

module.exports = MockUser;

function MockUser(clients) {
    return UserService(clients);
}
