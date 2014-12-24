'use strict';

module.exports = {
    '/register': {
        'POST': require('./register.js')
    },
    '/login': {
        'POST': loginUser
    },
    '/logout': {
        'POST': require('./logout.js')
    }
};

function loginUser(req, res, opts, cb) {

}
