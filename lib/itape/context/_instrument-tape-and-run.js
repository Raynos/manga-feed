'use strict';

var $process = require('process');

var env = $process.env;
var whiteList = JSON.parse(env.ITAPE_NPM_TAPE_WHITELIST);
var testProgram = env.ITAPE_NPM_TEST_PROGRAM;

if (whiteList) {
    instrumentTape(whiteList);
}

require(testProgram);

function instrumentTape(whiteList) {
    var tapeTest = require('tape/lib/test');

    var $run = tapeTest.prototype.run;
    tapeTest.prototype.run = function fakeRun() {
        if (whiteList.indexOf(this.name) === -1) {
            this._skip = true;
        }
        $run.apply(this, arguments);
    };
}
