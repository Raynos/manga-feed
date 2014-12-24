'use strict';

require('leaked-handles').set({
    timeout: 30000
});
// require('format-stack');

require('./unit.js');
require('../server/test/');
require('./integration');
