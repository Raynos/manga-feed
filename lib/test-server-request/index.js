'use strict';

var request = require('request');

module.exports = makeRequest;

function makeRequest(allocServer, reqOpts, cb) {
    allocServer(function onServer(err, server) {
        if (err) {
            return cb(err);
        }

        server.listen(0, onPort);

        function onPort() {
            var port = server.address().port;

            var url = 'http://localhost:' + port;
            reqOpts.url = url + reqOpts.url;

            request(reqOpts, onResponse);

            function onResponse() {
                server.close();

                cb.apply(this, arguments);
            }
        }
    });
}
