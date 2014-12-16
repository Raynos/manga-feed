'use strict';

var process = require('process');
var Transform = require('readable-stream').Transform;
var split = require('split');

var start = Date.now();
var endPattern = /(\d)+\.\.(\d)+/;
var fastThreshold = 100;
var mediumThreshold = 250;
var colors;

if (process.stdout && process.stdout.isTTY) {
    colors = require('ansi-styles');
}

process.stdin
    .pipe(split())
    .pipe(TimeReporter())
    .pipe(process.stdout);

function TimeReporter() {
    var stream = new Transform();

    stream.chunks = [];
    stream.finished = false;
    stream.startedTime = false;

    stream.flush = function flush() {
        var delta = Date.now() - this.startedTime;
        this.push(this.chunks.shift().trim() +
            formatDelta(delta));
        for (var i = 0; i < this.chunks.length; i++) {
            this.push(this.chunks[i] + '\n');
        }
        this.chunks = [];
        this.startedTime = null;
    };

    stream._transform = function onLine(line, _, cb) {
        var delta;
        line = String(line);

        if (endPattern.test(line) || this.finished) {
            if (!this.finished) {
                this.finished = true;
                this.flush();
            }

            if (line === '# ok') {
                delta = Date.now() - start;
                this.push('# ok (' + delta + ')\n');
            } else {
                this.push(line + '\n');
            }

            return cb();
        }

        if (line.indexOf('TAP version 13') === 0) {
            delta = Date.now() - start;
            this.push('# startup time' + formatDelta(delta));
            this.push(line + '\n');
        } else if (line[0] === '#') {
            if (this.chunks && this.chunks.length) {
                this.flush();
            }

            this.chunks = [line];
            this.startedTime = Date.now();
        } else {
            this.chunks.push(line);
        }
        cb();
    };

    return stream;
}

function formatDelta(delta) {
    var text = ' (' + delta + ')\n';

    if (!colors) {
        return text;
    }

    var color = delta < fastThreshold ?
        colors.green : delta < mediumThreshold ?
        colors.yellow : colors.red;

    return color.open + text + color.close;
}
