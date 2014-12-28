'use strict';

module.exports = {
    User: UserStruct
};

function UserStruct(opts) {
    if (!(this instanceof UserStruct)) {
        return new UserStruct(opts);
    }

    this.email = opts.email;
    this.id = opts.id || null;
    this.hash = opts.hash || null;
}
