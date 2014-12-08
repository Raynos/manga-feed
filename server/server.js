'use strict';

var http = require('http');
var fetchConfig = require('zero-config');

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
        server.on('request', accessLog(clients.logger));
        server.on('request', onRequest);

        cb(null, {
            httpServer: server,
            config: config,
            clients: clients,
            destroy: clients.destroy
        });

        function onRequest(req, res) {
            router(req, res, opts, onError);

            function onError(err) {
                if (!err) {
                    return;
                }

                res.statusCode = err.statusCode || 500;
                res.end(err.message);
            }
        }
    });
}

function accessLog(logger) {
    return function logRequest(req, res) {
        var start = Date.now();
        res.on('finish', function onFinish() {
            logger.access('a request was made', {
                statusCode: res.statusCode,
                time: Date.now() - start,
                uri: req.url,
                host: req.headers.host,
                method: req.method
            });
        });
    };
}
