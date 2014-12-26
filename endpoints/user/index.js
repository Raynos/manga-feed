'use strict';

module.exports = {
    '/register': {
        'POST': require('./register.js')
    },
    '/login': {
        'POST': require('./login.js')
    },
    '/logout': {
        'POST': require('./logout.js')
    }
};
