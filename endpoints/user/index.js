'use strict';

var ValidationError = require('error/validation');
var jsonBody = require('body/json');
var Validator = require('validate-form');

var validateRegister = Validator({
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
});

module.exports = {
    '/register': registerUser,
    '/login': loginUser,
    '/logout': logoutUser
};

function registerUser(req, res, opts, cb) {
    jsonBody(req, function onBody(err, body) {
        if (err) {
            return cb(err);
        }

        var errors = validateRegister(body);
        if (errors) {
            return cb(ValidationError(errors));
        }

        var userService = opts.services.user;

        userService.register({
            email: body.email,
            confirmEmail: body.confirmEmail,
            password: body.password
        });
    });
}

function loginUser(req, res, opts, cb) {

}

function logoutUser(req, res, opts, cb) {

}
