'use strict';

module.exports = {
    '/register': {
        'POST': require('./register')
    },
    '/login': {
        'POST': loginUser
    },
    '/logout': {
        'POST': logoutUser
    }
};

function loginUser(req, res, opts, cb) {

}

function logoutUser(req, res, opts, cb) {

}
