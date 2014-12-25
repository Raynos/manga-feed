'use strict';

var $process = require('process');

module.exports = traceMode;

function traceMode(ctx) {
    var packageFile = ctx.packageFile;
    var packageJson = require(packageFile);

    if (!packageJson.itape) {
        return;
    }

    var itapeConfig = packageJson.itape;
    var traceConfig = itapeConfig.trace;

    if (!traceConfig) {
        return;
    }

    if (traceConfig.debuglog) {
        $process.env.NODE_DEBUG =
            ($process.env.NODE_DEBUG || '') + ' ' +
            traceConfig.debuglog.join(' ');
    }
}
