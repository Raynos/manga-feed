'use strict';

var createServer = require('./server.js');

createServer({}, function onServer(err, service) {
    if (err) {
        throw err;
    }

    var config = service.config;
    var server = service.httpServer;
    var clients = service.clients;

    server.listen(config.get('port'), function onListen() {
        clients.logger.info('server listening on port', {
            port: server.address().port
        });
    });
});
