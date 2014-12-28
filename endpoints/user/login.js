'use strict';

var IOError = require('error/io');
var TypedError = require('error/typed');
var typedRequestHandler = require(
    '../../lib/typed-request-handler/');
var V = require('../../lib/schema-ast/');

var schemas = require('./schemas.js');

var AlreadyLoggedInError = TypedError({
    type: 'endpoints.user.already-logged-in',
    message: 'The user is already logged in.\n' +
        'Expected {email} to not be logged in.\n',
    statusCode: 400,
    email: null
});
var InvalidLoginCredentialsError = TypedError({
    type: 'endpoints.user.invalid-login-credentials',
    message: 'The user email or password is incorrect.\n' +
        'Expected {email} and password to be correct.\n',
    statusCode: 400,
    email: null
});

module.exports = typedRequestHandler(loginUser, {
    session: true,
    name: 'UserLogin',
    requestSchema: V.http.Request({
        method: 'POST',
        body: {
            email: V.email(),
            password: V.string({
                'minLength': 8,
                'maxLength': Infinity
            })
        }
    }),
    responseSchema: V.union([
        V.http.Response({
            statusCode: 200,
            body: schemas.UserModel
        }),
        V.http.TypedError(AlreadyLoggedInError, {
            email: V.string()
        }),
        V.http.TypedError(InvalidLoginCredentialsError, {
            email: V.string()
        })
    ])
});

function loginUser(treq, opts, cb) {
    opts.session.get('user', onUser);

    function onUser(err, user) {
        if (err) {
            return cb(IOError(err,
                'unexpected session failure'));
        }

        if (user) {
            return cb(AlreadyLoggedInError({
                email: user.email
            }));
        }

        var userService = opts.services.user;

        userService.verify({
            email: treq.body.email,
            password: treq.body.password
        }, onVerified);
    }

    function onVerified(err, user) {
        if (err && (
            err.type === 'services.user.invalid-password' ||
            err.type === 'services.user.non-existant-user'
        )) {
            return cb(InvalidLoginCredentialsError({
                email: treq.body.email
            }));
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
