'use strict';

var hammockRequest = require('../../../lib/hammock-request/');
var Router = require('../../../lib/http-hash-router/');

var mocks = require('../../../test/mocks/');
var register = require('../register.js');
var logout = require('../logout.js');

var userTests = require('./requests/');
userTests(allocUserServer, hammockRequest);

function allocUserServer() {
    var router = Router();
    var clients = {
        session: mocks.session(),
        level: mocks.level()
    };

    router.set('/register', register);
    router.set('/logout', logout);

    return mocks.server({
        clients: clients,
        services: {
            user: mocks.user(clients)
        },
        handler: router
    });
}
