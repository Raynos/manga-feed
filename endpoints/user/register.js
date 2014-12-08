'use strict';

var Validator = require('validate-form');

var typedRequestHandler = require('./lib/typed-request-handler.js');

module.exports = typedRequestHandler(registerUser, {
    session: true,
    validateBody: Validator({
        email: [
            Validator.truthy('is required'),
            Validator.isEmail('Must be an email')
        ],
        confirmEmail: [
            Validator.truthy('is required'),
            Validator.isEmail('Must be an email')
        ],
        password: [
            Validator.truthy('is required'),
            Validator.range(8, Infinity, 'Must be at least 8 char')
        ]
    })
});

function registerUser(treq, opts, cb) {
    opts.session.get('user', onUser);

    function onUser(err, user) {
        if (err) {
            return cb(err);
        }
        if (user) {
            return cb(new Error('already logged in'));
        }

        var userService = opts.services.user;

        userService.register({
            email: treq.body.email,
            confirmEmail: treq.body.confirmEmail,
            password: treq.body.password
        }, onRegistered);
    }

    function onRegistered(err, user) {
        if (err) {
            return cb(err);
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
