'use strict';

require('leaked-handles').set({
    timeout: 5000
});
// require('format-stack');

require('./unit.js');
require('../server/test/');
require('./integration');
