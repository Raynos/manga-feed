'use strict';

module.exports = errorToTypedResponse;

function errorToTypedResponse(err) {
    return {
        statusCode: err.statusCode || 500,
        body: enumerableError(err)
    };
}

function enumerableError(err) {
    Object.defineProperty(err, 'message', {
        value: err.message,
        configurable: true,
        enumerable: true
    });

    return err;
}
