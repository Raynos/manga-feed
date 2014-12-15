'use strict';

var genericSession = require('generic-session');

module.exports = MockSession;

function MockSession() {
    var store = genericSession.MemoryStore();

    return function createSession(req, res) {
        return genericSession(req, res, store);
    };
}
