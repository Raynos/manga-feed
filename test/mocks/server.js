'use strict';

var assert = require('assert');
var setTimeout = require('timers').setTimeout;
var clearTimeout = require('timers').clearTimeout;

module.exports = MockServer;

function MockServer(options) {
    assert(options, 'options is required');
    assert(options.clients, 'options.clients is required');
    assert(options.services, 'options.services is required');
    assert(options.handler, 'handler is required');

    var clients = options.clients;
    var services = options.services;
    var handler = options.handler;

    var httpOptions = {
        clients: clients,
        services: services
    };

    var timeout = setTimeout(blowup, 1000);

    return {
        httpServer: httpHandler,
        clients: clients,
        services: services,
        destroy: destroy
    };

    function blowup() {
        throw new Error('Forgot to `.destroy()` the mockServer');
    }

    function destroy() {
        clearTimeout(timeout);

        if (typeof clients.destroy === 'function') {
            clients.destroy();
        }
    }

    function httpHandler(req, res) {
        handler(req, res, httpOptions, defaultErrorHandler);

        function defaultErrorHandler(err) {
            if (err) {
                res.statusCode = err.statusCode || 500;
                res.end(err.message);
            }
        }
    }
}
