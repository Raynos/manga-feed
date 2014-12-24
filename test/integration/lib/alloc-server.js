'use strict';

var path = require('path');
var os = require('os');
var cuid = require('cuid');

var createServer = require('../../../server/server.js');

module.exports = allocServer;

function allocServer() {
    var server = createServer({
        seed: {
            clients: {
                logtron: {
                    console: false
                },
                level: {
                    location: path.join(os.tmpDir(),
                        'manga-feed-level-' + cuid())
                }
            }
        }
    });

    var httpServer = server.httpServer;

    server.once('open', function onOpen() {
        httpServer.listen(0);
    });

    return server;
}
