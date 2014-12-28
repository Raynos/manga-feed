'use strict';

var path = require('path');
var ServeBrowserify = require('serve-browserify');
var h = require('mercury').h;
var sendHtml = require('send-data/html');
var stringify = require('virtual-dom-stringify');

module.exports = {
    '/app/js/:id': {
        'GET': ServeBrowserify({
            root: path.join(__dirname, '..', 'main'),
            base: '/app/js',
            debug: true
        })
    },
    '/': {
        'GET': serveHomePage
    }
};

function serveHomePage(req, res) {
    var homePage = renderHome();
    var page = layout(homePage);

    sendHtml(req, res, {
        statusCode: 200,
        body: '<!DOCTYPE html>' + stringify(page)
    });
}

function renderHome() {
    return h('div', 'hello world');
}

function layout(page) {
    return h('html', [
        h('head', [
            h('title', 'MangaFeed')
        ]),
        h('body', [
            h('main', page),
            h('script', {
                src: '/app/js/entry.js'
            })
        ])
    ]);
}
