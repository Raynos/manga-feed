'use strict';

var extend = require('xtend');
var url = require('url');
var jsonBody = require('body/json');
var querystring = require('querystring');
var sendJSON = require('send-data/json');
var ValidationError = require('error/validation');

module.exports = typedRequestHandler;

function typedRequestHandler(typedHandler, options) {
    var h = typedHandler;
    if (options.validateBody) {
        h = withValidation(h);
    }
    h = toTypedRequest(h);
    if (options.session) {
        h = addSessionRequest(h);
    }
    return h;
}

function toTypedRequest(typedHandler) {
    return httpHandler;

    function httpHandler(req, res, opts, cb) {
        jsonBody(req, res, onBody);

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

function addSessionRequest(httpHandler) {
    return function handler(req, res, opts, cb) {
        if (!opts.clients.session) {
            throw new Error('cannot create session');
        }

        opts.session = opts.clients.session(req, res);
        httpHandler.apply(this, arguments);
    };
}

function withValidation(typedHandler, validation) {
    return function typedHandler(treq, opts, cb) {
        var errors = validation(treq.body);
        if (errors) {
            return cb(ValidationError(errors));
        }

        typedHandler.apply(this, arguments);
    };
}

function serializerError(req, res, err) {
    sendJSON(req, res, {
        statusCode: err.statusCode || 500,
        body: err
    });
}

function TypedRequest(req, body) {
    var parsedUrl = url.parse(req.url);

    this.method = req.method;
    this.url = req.url;
    this.query = querystring.parse(parsedUrl.query);
    this.httpVersion = req.httpVersion;
    this.headers = extend({}, req.headers);
    this.body = body;
}
