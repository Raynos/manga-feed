'use strict';

var http = require('http');
var fetchConfig = require('zero-config');

var accessLog = require('../lib/http-access-log/');
var createClients = require('./clients/');
var Router = require('./router.js');

module.exports = createServer;

function createServer(options, cb) {
    var config = fetchConfig(__dirname, {
        seed: options.seed
    });

    createClients(config, function onClients(err, clients) {
        if (err) {
            return cb(err);
        }

        var router = Router();
        var opts = {
            clients: clients,
            config: config
        };
        var server = http.createServer();
        server.on('request', accessLog(clients.logger.access));
        server.on('request', onRequest);

        cb(null, {
            httpServer: server,
            config: config,
            clients: clients,
            destroy: clients.destroy
        });

        function onRequest(req, res) {
            router(req, res, opts, handleError);

            function handleError(err) {
                if (err) {
                    res.statusCode = err.statusCode || 500;
                    res.end(err.message);
                }
            }
        }
    });
}
