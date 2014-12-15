'use strict';

var levelmem = require('level-mem');

module.exports = MockLevel;

function MockLevel() {
    return levelmem('key', {
        valueEncoding: 'json'
    });
}
