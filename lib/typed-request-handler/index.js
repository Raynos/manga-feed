'use strict';

var ValidationError = require('error/validation');

var toTypedRequest = require('./parse-typed-request.js');

module.exports = typedRequestHandler;

function typedRequestHandler(typedHandler, options) {
    var h = typedHandler;
    if (options.validateBody) {
        h = withValidation(h, options.validateBody);
    }
    h = toTypedRequest(h);
    if (options.session) {
        h = addSessionRequest(h);
    }
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

function withValidation(typedHandler, validation) {
    return function h(treq, opts, cb) {
        var errors = validation(treq.body);
        if (errors) {
            return cb(ValidationError(errors));
        }

        typedHandler.apply(this, arguments);
    };
}
