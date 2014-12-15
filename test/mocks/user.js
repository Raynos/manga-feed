'use strict';

module.exports = MockUser;

function MockUser() {
    return {
        register: function register(user, cb) {
            cb(null, {
                email: user.email
            });
        }
    };
}
