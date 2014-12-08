'use strict';

var request = require('request');

module.exports = makeRequest;

function makeRequest(createServer, reqOpts, cb) {
    var _server;
    createServer({
        seed: {
            clients: {
                logtron: {
                    console: false
                }
            }
        }
    }, function onServer(err, service) {
        if (err) {
            return cb(err);
        }

        var server = service.httpServer;
        _server = server;
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
    };
}
