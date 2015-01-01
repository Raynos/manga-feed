'use strict';

var hg = require('mercury');

var render = require('./view.js');
var Navigation = require('../navigation/');

function MainApp() {
    return hg.state({
        nav: Navigation()
    });
}

MainApp.render = render;

module.exports = MainApp;
