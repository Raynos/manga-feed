'use strict';

var levelSublevel = require('level-sublevel');
var pcrypt = require('pcrypt');
var Secondary = require('level-secondary');

module.exports = UserData;

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
        comparePassword: function comparePassword(pw, hash, cb) {
            passGen.compare(pw, hash, cb);
        },
        storeUser: function storeUser(user, callback) {
            usersDb.put(user.id, user, callback);
        }
    };
}
