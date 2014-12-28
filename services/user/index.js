'use strict';

var cuid = require('cuid');
var TypedError = require('error/typed');
var assert = require('assert');

var UserData = require('./data.js');
var Structs = require('./struct.js');

var DuplicateEmailError = TypedError({
    type: 'services.user.duplicate-email',
    message: 'A user with that email already exists.\n' +
        'Expected {email} to not exist.\n',
    statusCode: 400,
    email: null
});
var NonExistantUserError = TypedError({
    type: 'services.user.non-existant-user',
    message: 'A user with that email does not exist.\n' +
        'Expected {email} to exist.\n',
    statusCode: 404,
    email: null
});
var InvalidPasswordError = TypedError({
    type: 'services.user.invalid-password',
    message: 'The password is invalid for requested user.\n' +
        'Expected password to match {hash} for user {email}.\n',
    statusCode: 400,
    email: null,
    hash: null
});

module.exports = UserService;

function UserService(clients) {
    if (!(this instanceof UserService)) {
        return new UserService(clients);
    }

    assert.ok(clients.level, 'clients.level required');

    this.data = UserData(clients);
}

var proto = UserService.prototype;

proto.create = function create(userArg, callback) {
    var self = this;
    var userObj = Structs.User(userArg);
    userObj.id = cuid();

    self.data.getByEmail(userObj.email, onUser);

    function onUser(err, user) {
        if (err && !err.notFound) {
            return callback(err);
        }

        if (user) {
            return callback(DuplicateEmailError({
                email: userObj.email
            }));
        }

        self.data.generatePassword(userArg.password, onHash);
    }

    function onHash(err, hash) {
        if (err) {
            return callback(err);
        }

        userObj.hash = hash;

        self.data.storeUser(userObj, onWrite);
    }

    function onWrite(err) {
        if (err) {
            return callback(err);
        }

        callback(null, userObj);
    }
};

proto.verify = function verify(userArg, cb) {
    var self = this;

    self.data.getByEmail(userArg.email, onUser);

    function onUser(err, user) {
        if (err && !('notFound' in err)) {
            return cb(err);
        }

        if (err && err.notFound) {
            return cb(NonExistantUserError({
                email: userArg.email
            }));
        }

        self.data.comparePassword(userArg.password,
            user.hash, onCompare);

        function onCompare(err, match) {
            if (err) {
                return cb(err);
            }

            if (!match) {
                return cb(InvalidPasswordError({
                    email: userArg.email,
                    hash: user.hash
                }));
            }

            var userObj = Structs.User(user);
            cb(null, userObj);
        }
    }
};
