'use strict';

var levelSublevel = require('level-sublevel');
var cuid = require('cuid');
var pcrypt = require('pcrypt');
var Secondary = require('level-secondary');

module.exports = UserService;

function UserService(clients) {
    var db = levelSublevel(clients.level);
    var usersDb = db.sublevel('users', {
        valueEncoding: 'json'
    });
    var passGen = pcrypt();

    var emailIndex = Secondary(usersDb, 'email');

    return {
        register: register
    };

    function register(user, callback) {
        var userObj = new UserStruct(user);
        userObj.id = cuid();

        emailIndex.get(user.email, onUser);

        function onUser(err, user) {
            if (err && !err.notFound) {
                return callback(err);
            }

            if (user) {
                return callback(new Error('duplicate email'));
            }

            passGen.gen(userObj.password, onHash);
        }

        function onHash(err, hash) {
            if (err) {
                return callback(err);
            }

            userObj.password = null;
            userObj.hash = hash;

            usersDb.put(userObj.id, userObj, onWrite);

            function onWrite(err) {
                if (err) {
                    return callback(err);
                }

                callback(null, userObj);
            }
        }
    }
}

function UserStruct(opts) {
    this.username = opts.email;
    this.email = opts.email;
    this.password = opts.password;
    this.id = null;
    this.hash = null;
}
