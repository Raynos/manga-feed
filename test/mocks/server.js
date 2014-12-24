'use strict';

var assert = require('assert');

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

    return {
        httpServer: httpHandler,
        clients: clients,
        services: services,
        destroy: destroy
    };

    function destroy() {
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
