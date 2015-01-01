'use strict';

var h = require('mercury').h;

var Navigation = require('../navigation/');

var styles = {
    mainView: {
        width: '100%',
        height: '100%'
    }
};

module.exports = renderHome;

function renderHome(state) {
    return h('.main-view', {
        style: styles.mainView
    }, [
        Navigation.render(state.nav)
    ]);
}
