'use strict';

var createServer = require('./server.js');

var service = createServer({});

var config = service.config;
var server = service.httpServer;
var clients = service.clients;

service.once('open', function onOpen() {
    server.listen(config.get('port'), function onListen() {
        clients.logger.info('server listening on port', {
            port: server.address().port
        });
    });
});
