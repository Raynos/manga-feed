#!/usr/bin/env node

'use strict';

var parseArgs = require('minimist');

var Context = require('./context/');
var normalMode = require('./modes/normal.js');
var failMode = require('./modes/fail.js');
var traceMode = require('./modes/trace.js');

/*Usage

`itape test/index.js` to capture TAP
`itape --fail test/index.js` to run in failure mode.
fix tests
`itape --fail test/index.js` to run in failure mode again.

We write the TAP output of every run to the correct files.

We only write TAP output when we are done.

 - if `--debug`
    - ...

*/

function main(argv) {
    var context = Context(argv);

    // - if no filename, just bail.
    if (!context.testProgram) {
        return null;
    }

    // - if no last-run-file, run normal
    // - if last-run-file different run normal
    // - if no tap-output run normal
    if (
        !context.lastFilePath ||
        context.lastFilePath !== context.testProgram ||
        !context.lastRunTap
    ) {
        printMode('normal', 'no previous run');
        return normalMode(context);
    }

    // - if `--trace` then turn on tracing
    if (argv.trace) {
        printMode('trace', 'trace flag');
        traceMode(context);
    }

    // - if `--fail` or `--trace`
    if ((argv.fail || argv.trace)) {
        // - if tap-output contains no fails, run normal
        if (context.tapOutput.fail.length === 0) {
            printMode('normal', 'no failing tests');
            return normalMode(context);
        }

        // - else run in fail mode
        var reason = argv.fail ? 'fail flag' : 'trace flag';
        printMode('fail', reason);
        return failMode(context);
    }

    printMode('normal', 'default mode');
    normalMode(context);
}

function printMode(mode, reason) {
    console.log('[itape]: ' + mode + ' mode (' + reason + ')');
}

if (require.main === module) {
    main(parseArgs(process.argv.slice(2)));
}
