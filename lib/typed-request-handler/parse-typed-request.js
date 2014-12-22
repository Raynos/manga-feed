'use strict';

var extend = require('xtend');
var url = require('url');
var jsonBody = require('body/json');
var querystring = require('querystring');
var sendJSON = require('send-data/json');

var jsonType = 'application/json';

module.exports = toTypedRequest;

function toTypedRequest(typedHandler) {
    return httpHandler;

    function httpHandler(req, res, opts, cb) {
        var contentType = req.headers['content-type'];

        if (contentType &&
            contentType.lastIndexOf(jsonType, 0) !== -1
        ) {
            jsonBody(req, res, onBody);
        } else {
            onBody(null, undefined);
        }

        function onBody(err, body) {
            if (err) {
                return serializerError(req, res, err);
            }

            var treq = new TypedRequest(req, body);

            typedHandler(treq, opts, onTypedResponse);
        }

        function onTypedResponse(err, tres) {
            if (err) {
                return serializerError(req, res, err);
            }

            sendJSON(req, res, {
                headers: tres.headers || {},
                statusCode: tres.statusCode || 200,
                body: tres.body
            }, cb);
        }
    }
}

function serializerError(req, res, err) {
    sendJSON(req, res, {
        statusCode: err.statusCode || 500,
        body: enumerableError(err)
    });
}

function enumerableError(err) {
    Object.defineProperty(err, 'message', {
        value: err.message,
        configurable: true,
        enumerable: true,
        writable: true
    });

    Object.defineProperty(err, 'stack', {
        value: err.stack,
        configurable: true,
        enumerable: true,
        writable: true
    });

    Object.defineProperty(err, 'type', {
        value: err.type,
        configurable: true,
        enumerable: true,
        writable: true
    });

    return err;
}

function TypedRequest(req, body) {
    var parsedUrl = url.parse(req.url);

    this.method = req.method;
    this.url = req.url;
    this.query = querystring.parse(parsedUrl.query);
    this.httpVersion = req.httpVersion;
    this.headers = extend({}, req.headers);

    if (body !== undefined) {
        this.body = body;
    }
}
