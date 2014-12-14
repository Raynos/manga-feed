'use strict';

var path = require('path');
var os = require('os');
var cuid = require('cuid');

var createApp = require('../../server.js');

module.exports = allocServer;

function allocServer(callback) {
    createApp({
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
            return callback(err);
        }

        var server = app.httpServer;

        var $close = server.close;
        server.close = function fakeClose() {
            app.destroy();
            return $close.apply(this, arguments);
        };

        callback(null, server);
    });
}
