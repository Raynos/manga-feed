'use strict';

var Result = require('rust-result');

var validateShape = require('./validate-shape.js');
var toTypedRequest = require('./parse-typed-request.js');

module.exports = typedRequestHandler;

function typedRequestHandler(typedHandler, options) {
    var h = typedHandler;
    if (options.requestSchema) {
        h = withReqValidation(h, options.requestSchema);
    }
    if (options.responseSchema) {
        h = withResValidation(h, options.responseSchema);
    }
    h = toTypedRequest(h);
    if (options.session) {
        h = addSessionRequest(h);
    }

    h.requestSchema = options.requestSchema;
    h.responseSchema = options.responseSchema;

    return h;
}

function addSessionRequest(httpHandler) {
    return function handler(req, res, opts, cb) {
        if (!opts.clients || !opts.clients.session) {
            throw new Error('cannot create session');
        }

        opts.session = opts.clients.session(req, res);
        httpHandler.apply(this, arguments);
    };
}

function withReqValidation(typedHandler, schema) {
    return function h(treq, opts, cb) {
        var result = validateShape(schema, treq);
        if (Result.isErr(result)) {
            return cb(Result.Err(result));
        }

        typedHandler.apply(this, arguments);
    };
}

function withResValidation(typedHandler, schema) {
    return function h(treq, opts, cb) {
        typedHandler.call(this, treq, opts, onResponse);

        function onResponse(err, tres) {
            if (err) {
                return cb(err);
            }

            tres = new TypedResponse(tres);

            var result = validateShape(schema, tres);
            if (Result.isErr(result)) {
                return cb(Result.Err(result));
            }

            cb(null, tres);
        }
    };
}

function TypedResponse(resp) {
    this.headers = resp.headers || {};
    this.statusCode = resp.statusCode;
    this.body = resp.body || undefined;
}
