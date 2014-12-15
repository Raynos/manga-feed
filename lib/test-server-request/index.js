'use strict';

var request = require('request');

makeRequest.jar = request.jar;

module.exports = makeRequest;

function makeRequest(server, reqOpts, cb) {
    if (server.address()) {
        onPort();
    } else {
        server.once('listening', onPort);
    }

    function onPort() {
        var port = server.address().port;

        var url = 'http://localhost:' + port;
        reqOpts.url = url + reqOpts.url;

        request(reqOpts, cb);
    }
}
