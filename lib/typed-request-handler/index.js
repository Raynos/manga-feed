'use strict';

var assert = require('assert');
var Result = require('rust-result');
var TypedError = require('error/typed');

var validateShape = require('./validate-shape-themis.js');
var toTypedRequest = require('./parse-typed-request.js');
var errorToTypedResponse = require('./error-to-typed-response');

var RequestError = TypedError({
    message: '{message}',
    type: 'typed-request-handler.request-failure',
    isRequestError: true,
    messages: null
});
var ResponseError = TypedError({
    message: '{message}',
    type: 'typed-request-handler.response-failure',
    isResponseError: true,
    messages: null
});

module.exports = typedRequestHandler;

function typedRequestHandler(typedHandler, options) {
    assert(options, 'options required');
    assert(options.requestSchema, 'requestSchema required');
    assert(options.responseSchema, 'responseSchema required');

    var h = typedHandler;
    h = withReqValidation(h, options.requestSchema);
    h = withResValidation(h, options.responseSchema);
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
            var err = Result.Err(result);
            return cb(RequestError(err));
        }

        typedHandler.apply(this, arguments);
    };
}

function withResValidation(typedHandler, schema) {
    return function h(treq, opts, cb) {
        typedHandler.call(this, treq, opts, onResponse);

        function onResponse(err, tres) {
            if (err) {
                tres = errorToTypedResponse(err);
            }

            tres = new TypedResponse(tres);

            var result = validateShape(schema, tres);
            if (Result.isErr(result)) {
                var error = Result.Err(result);
                return cb(ResponseError(error));
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
