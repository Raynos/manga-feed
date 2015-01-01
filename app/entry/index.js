'use strict';

var hg = require('mercury');
var virtualize = require('vdom-virtualize');
var document = require('global/document');

var MainApp = require('../main/');

var app = MainApp();
var targetElem = document.getElementsByTagName('main')[0].firstChild;
var prevTree = virtualize(targetElem);

hg.app(null, app, MainApp.render, {
    initialTree: prevTree,
    target: targetElem
});

// trigger re-render
app.set(app());
