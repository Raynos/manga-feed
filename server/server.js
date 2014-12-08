'use strict';

var http = require('http');
var fetchConfig = require('zero-config');

var createClients = require('./clients/');

module.exports = createServer;

function createServer(cb) {
    var conf = fetchConfig(__dirname);

    createClients(conf, function onClients(err, clients) {
        if (err) {
            return cb(err);
        }

        var server = http.createServer();

        cb(null, {
            httpServer: server,
            config: conf,
            clients: clients
        });
    });
}
