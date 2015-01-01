'use strict';

var hg = require('mercury');

var render = require('./view.js');

function Navigation() {
    return hg.state();
}

Navigation.render = render;

module.exports = Navigation;
