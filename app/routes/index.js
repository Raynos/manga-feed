'use strict';

var path = require('path');
var ServeBrowserify = require('serve-browserify');
var h = require('mercury').h;
var sendHtml = require('send-data/html');
var stringify = require('virtual-dom-stringify');
var requireFresh = require('require-fresh');

var loadPage = requireFresh({
    dir: path.join(__dirname, '..'),
    watch: true
});

module.exports = {
    '/app/js/:id': {
        'GET': ServeBrowserify({
            root: path.join(__dirname, '..', 'entry'),
            base: '/app/js',
            debug: true
        })
    },
    '/': {
        'GET': serveHomePage
    }
};

function serveHomePage(req, res) {
    var MainApp = loadPage('./main/');

    var app = MainApp();
    var page = layout(MainApp.render(app));

    sendHtml(req, res, {
        statusCode: 200,
        body: '<!DOCTYPE html>' + stringify(page)
    });
}

function layout(page) {
    return h('html', [
        h('head', [
            h('title', 'MangaFeed'),
            h('style', {
                type: 'text/css'
            },
                'html, body {\n' +
                '    width: 100%;\n' +
                '    height: 100%;\n' +
                '    padding: 0;\n' +
                '    margin: 0;\n' +
                '}\n'
            )
        ]),
        h('body', [
            h('main', page),
            h('script', {
                src: '/app/js/index.js'
            })
        ])
    ]);
}
