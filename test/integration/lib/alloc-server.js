'use strict';

var path = require('path');
var os = require('os');
var cuid = require('cuid');

var createApp = require('../../../server/server.js');

module.exports = allocServer;

function allocServer() {
    var httpServer = createApp({
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
    }, function onServer(err, app) {
        if (err) {
            return httpServer.emit('error', err);
        }

        var $close = httpServer.close;
        httpServer.close = function fakeClose() {
            app.destroy();
            return $close.apply(this, arguments);
        };

        httpServer.listen(0);
    });

    return httpServer;
}
