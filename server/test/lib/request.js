'use strict';

var request = require('request');
var path = require('path');
var os = require('os');
var cuid = require('cuid');

module.exports = makeRequest;

function makeRequest(createServer, reqOpts, cb) {
    var _server;
    var _destroy;
    createServer({
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
    }, function onServer(err, service) {
        if (err) {
            return cb(err);
        }

        var server = service.httpServer;
        _server = server;
        _destroy = service.destroy;
        server.listen(0, onPort);

        function onPort() {
            var port = server.address().port;

            var url = 'http://localhost:' + port;
            reqOpts.url = url + reqOpts.url;

            request(reqOpts, cb);
        }
    });

    return function destroy() {
        _server.close();
        _destroy();
    };
}
