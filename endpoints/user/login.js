'use strict';

var IOError = require('error/io');
var typedRequestHandler = require(
    '../../lib/typed-request-handler/');
var V = require('../../lib/schema-ast/');

var schemas = require('./schemas.js');

module.exports = typedRequestHandler(loginUser, {
    session: true,
    name: 'UserLogin',
    requestSchema: V.http.Request({
        method: 'POST'
    }),
    responseSchema: V.http.Response({
        statusCode: 200,
        body: schemas.UserModel
    })
});

function loginUser(treq, opts, cb) {
    opts.session.get('user', onUser);

    function onUser(err, user) {
        if (err) {
            return cb(IOError(err,
                'unexpected session failure'));
        }

        if (user) {
            return cb(new Error('already logged in'));
        }

        var userService = opts.services.user;

        userService.verify({
            email: treq.body.email,
            password: treq.body.password
        }, onVerified);
    }

    function onVerified(err, user) {
        if (err && err.type) {
            return cb(err);
        } else if (err) {
            return cb(IOError(err,
                'unexpected user service failure'));
        }

        opts.session.set('user', user, onSessionSet);

        function onSessionSet(err) {
            if (err) {
                return cb(IOError(err,
                    'unexpected session failure'));
            }

            cb(null, {
                statusCode: 200,
                body: user
            });
        }
    }
}
