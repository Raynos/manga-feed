'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var process = require('process');
var TapParser = require('tap-out').Parser;
var Transform = require('readable-stream').Transform;
var extend = require('xtend');

var getTapFolderInfo = require('./get-tap-folder.js');

var testRunner = path.join(__dirname,
    '_instrument-tape-and-run.js');

module.exports = Context;

function Context(argv) {
    if (!(this instanceof Context)) {
        return new Context(argv);
    }

    var tapFolder = getTapFolderInfo();
    var cacheFolder = tapFolder.cacheFolder;
    var packageFolder = tapFolder.packageFolder;

    this._argv = argv;

    this.testProgram = argv._[0];
    this.lastFilePathFile = path.join(cacheFolder,
        'last-run-file.log');
    this.lastRunTapFile = path.join(cacheFolder, 'last-run.tap');
    this.packageFile = path.join(packageFolder, 'package.json');

    this.lastFilePath = safeReadFile(this.lastFilePathFile);
    this.lastRunTap = safeReadFile(this.lastRunTapFile);

    this.options = {
        trace: argv.trace,
        fail: argv.fail
    };

    var parser = TapParser();
    this.lastRunTap.split('\n')
        .forEach(parser.handleLine.bind(parser));
    this.tapOutput = parser.results;
}

var proto = Context.prototype;

proto.spawnTest = function spawnTest(opts) {
    opts = opts || {};
    fs.writeFileSync(this.lastFilePathFile, this.testProgram);

    // trick eslint.
    var $process = process;

    var child = spawn('node', [testRunner], {
        cwd: $process.cwd(),
        env: extend($process.env, {
            ITAPE_NPM_TEST_PROGRAM:
                path.resolve(this.testProgram),
            ITAPE_NPM_TAPE_WHITELIST:
                JSON.stringify(opts.whiteList || false)
        })
    });
    var childStdout = child.stdout;

    if (opts.stdoutFilter) {
        childStdout = filterStream(childStdout, opts.stdoutFilter);
    }

    childStdout.pipe($process.stdout);
    child.stderr.pipe($process.stderr);

    // TODO. do not write to TAP file for invalid TAP.
    // i.e. a crashed uncaught exception child process.
    var writeStream = fs.createWriteStream(this.lastRunTapFile);
    child.stdout.pipe(writeStream);

    return child;
};

function filterStream(stream, lambda) {
    var filter = new Transform();
    filter._transform = function filter(chunk, _, cb) {
        if (lambda(chunk)) {
            this.push(chunk);
        }
        cb();
    };

    return stream.pipe(filter);
}

function safeReadFile(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    } else {
        return '';
    }
}
