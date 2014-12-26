'use strict';

var levelSublevel = require('level-sublevel');
var cuid = require('cuid');
var pcrypt = require('pcrypt');
var Secondary = require('level-secondary');
var TypedError = require('error/typed');
var assert = require('assert');

var DuplicateEmailError = TypedError({
    type: 'services.user.duplicate-email',
    message: 'A user with that email already exists',
    statusCode: 400
});

module.exports = UserService;

function UserStruct(opts) {
    this.email = opts.email;
    this.id = null;
    this.hash = null;
}

function UserData(clients) {
    var db = levelSublevel(clients.level);
    var usersDb = db.sublevel('users', {
        valueEncoding: 'json'
    });
    var passGen = pcrypt();

    var emailIndex = Secondary(usersDb, 'email');

    return {
        getByEmail: function getByEmail(email, callback) {
            emailIndex.get(email, callback);
        },
        generatePassword: function genPassword(pw, callback) {
            passGen.gen(pw, callback);
        },
        storeUser: function storeUser(user, callback) {
            usersDb.put(user.id, user, callback);
        }
    };
}

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
    var userObj = new UserStruct(userArg);
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
