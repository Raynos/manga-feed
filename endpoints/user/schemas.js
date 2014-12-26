'use strict';

var V = require('../../lib/schema-ast/');

var UserModel = {
    email: V.email(),
    id: V.string(),
    hash: V.string()
};

module.exports = {
    UserModel: UserModel
};
