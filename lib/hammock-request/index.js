'use strict';

var HammockRequest = require('hammock/request');
var HammockResponse = require('hammock/response');
var tough = require('tough-cookie');
var url = require('url');

hammockRequest.jar = function jar() {
    return new tough.CookieJar();
};

module.exports = hammockRequest;

function hammockRequest(handler, req, cb) {
    var mockReq = HammockRequest(req);
    var mockRes = HammockResponse(onResponse);

    if (req.url.indexOf('http:') !== 0 &&
        req.url.indexOf('https:') !== 0
    ) {
        req.url = 'http://localhost' + req.url;
    }

    var uri = url.parse(req.url);

    if ('json' in req && req.json !== true) {
        mockReq.headers['content-type'] = 'application/json';
    }
    if (req.jar) {
        var cookies = req.jar.getCookieStringSync(uri.href);
        if (cookies && cookies.length) {
            if (Array.isArray(cookies)) {
                cookies = cookies.join('; ');
            }
            mockReq.headers = mockReq.headers || {};
            mockReq.headers.cookie = cookies;
        }
    }

    handler(mockReq, mockRes);

    if ('json' in req && req.json !== true) {
        mockReq.write(JSON.stringify(req.json));
        mockReq.end();
    } else {
        mockReq.end();
    }

    function onResponse(err, resp) {
        if (err) {
            return cb(err);
        }

        if ('json' in req) {
            resp.body = JSON.parse(resp.body);
        }

        if (req.jar && resp.headers['set-cookie']) {
            var header = resp.headers['set-cookie'];
            if (Array.isArray(header)) {
                header = header.join('; ');
            }
            var cookie = tough.Cookie.parse(header);
            req.jar.setCookieSync(cookie, uri.href);
        }

        cb(null, resp);
    }
}
