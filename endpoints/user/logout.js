'use strict';

var IOError = require('error/io');
var typedRequestHandler = require(
    '../../lib/typed-request-handler/');
// var V = require('../../lib/schema-ast/');

module.exports = typedRequestHandler(logoutUser, {
    session: true,
    name: 'UserLogout'
});

function logoutUser(treq, opts, cb) {
    opts.session.del('user', onUserRemoved);

    function onUserRemoved(err, user) {
        if (err) {
            return cb(IOError(err,
                'unexpected session failure'));
        }

        cb(null, {
            statusCode: 200,
            body: 'ok'
        });
    }
}
