'use strict';

var http = require('http');
var fetchConfig = require('zero-config');
var EventEmitter = require('events').EventEmitter;
var accessLog = require('../lib/http-access-log/');

var createClients = require('./clients/');
var createServices = require('../services/');
var Router = require('./router.js');

module.exports = createServer;

function createServer(options) {
    var server = new EventEmitter();
    var config = fetchConfig(__dirname, {
        seed: options.seed
    });

    var clients = createClients(config, onReady);
    var services = createServices(clients);
    var httpServer = http.createServer();
    var router = Router();

    var opts = {
        clients: clients,
        config: config,
        services: services
    };

    httpServer.on('request',
        accessLog(clients.logger.access));
    httpServer.on('request', onRequest);

    server.httpServer = httpServer;
    server.config = config;
    server.clients = clients;
    server.destroy = destroy;

    return server;

    function onRequest(req, res) {
        router.handler(req, res, opts, handleError);

        function handleError(err) {
            if (err) {
                res.statusCode = err.statusCode || 500;
                res.end(err.message);
            }
        }
    }

    function onReady(err) {
        if (err) {
            return server.emit('error', err);
        }

        server.emit('open');
    }

    function destroy() {
        clients.destroy();
        httpServer.close();
    }
}
