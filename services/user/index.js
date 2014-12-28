'use strict';

var cuid = require('cuid');
var TypedError = require('error/typed');
var assert = require('assert');

var UserData = require('./data.js');
var Structs = require('./struct.js');

var DuplicateEmailError = TypedError({
    type: 'services.user.duplicate-email',
    message: 'A user with that email already exists',
    statusCode: 400
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
            return callback(DuplicateEmailError());
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
        if (err) {
            return cb(err);
        }

        var userObj = Structs.User(user);
        cb(null, userObj);
    }
};
