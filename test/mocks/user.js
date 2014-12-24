'use strict';

var assert = require('assert');

var UserService = require('../../services/user/');

module.exports = MockUser;

function MockUser(clients) {
    assert(clients, 'clients is required');

    return UserService(clients);
}
