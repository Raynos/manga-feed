'use strict';

var TypedError = require('error/typed');
var IOError = require('error/io');
var typedRequestHandler = require(
    '../../lib/typed-request-handler/');
var V = require('../../lib/schema-ast/');

var schemas = require('./schemas.js');

var LoggedInError = TypedError({
    type: 'endpoints.user.register.already-logged-in',
    message: 'User is already logged in',
    statusCode: 400
});
var EmailNotSameError = TypedError({
    type: 'endpoints.user.register.email-not-same',
    message: 'The confirm email is not the same as the email',
    statusCode: 400
});

module.exports = typedRequestHandler(registerUser, {
    session: true,
    name: 'UserRegister',
    requestSchema: V.http.Request({
        method: 'POST',
        body: {
            email: V.email(),
            confirmEmail: V.email(),
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
        V.http.TypedError({
            statusCode: 400,
            type: 'services.user.duplicate-email'
        }, {
            email: V.string()
        }),
        V.http.TypedError(LoggedInError),
        V.http.TypedError(EmailNotSameError)
    ])
});

function registerUser(treq, opts, cb) {
    opts.session.get('user', onUser);

    function onUser(err, user) {
        if (err) {
            return cb(IOError(err,
                'unexpected session failure'));
        }

        if (user) {
            return cb(LoggedInError());
        }

        if (treq.body.email !== treq.body.confirmEmail) {
            return cb(EmailNotSameError());
        }

        var userService = opts.services.user;

        userService.create({
            email: treq.body.email,
            password: treq.body.password
        }, onRegistered);
    }

    function onRegistered(err, user) {
        if (err && err.type) {
            return cb(err);
        } else if (err) {
            return cb(IOError(err,
                'unexpected user service failure'));
        }

        /* failure to write to session is failed login,
         * its not a failed register. So register succeeds
         * either way.
         */
        opts.session.set('user', user);
        cb(null, {
            statusCode: 200,
            body: user
        });
    }
}
