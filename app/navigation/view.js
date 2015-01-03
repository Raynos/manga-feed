'use strict';

var h = require('mercury').h;

var styles = {
    navBar: {
        height: '50px',
        padding: '5px',
        border: '2px solid white',
        color: 'white',
        backgroundColor: 'black'
    },
    logoContainer: {
        float: 'left',
        height: '80%',
        marginTop: '5px',
        marginBottom: '5px',
        marginLeft: '20px',
        fontSize: '2em'
    },
    userAuth: {
        position: 'relative',
        float: 'right',
        fontSize: '1.5em'
    },
    userName: {
        marginTop: '10px',
        marginRight: '20px',
        height: '60%',
        marginBottom: '10px'
    },
    logoutButton: {
        display: 'inline'
    }
};

module.exports = render;

function render() {
    return h('.nav-bar', {
        style: styles.navBar
    }, [
        logo(),
        userAuth()
    ]);
}

function logo() {
    return h('.logo-container', {
        style: styles.logoContainer
    }, [
        'MangaFeed'
    ]);
}

function userAuth() {
    var isLoggedIn = true;

    return h('.user-auth', {
        style: styles.userAuth
    }, [
        isLoggedIn ? userInfo() : null
    ]);
}

function userInfo() {
    return h('.user-info', [
        h('.user-name', {
            style: styles.userName
        }, [
            'Raynos'
        ]),
        h('.user-logout', {
            style: styles.logoutButton
        }, [
            h('button', {}, 'Logout')
        ])
    ]);
}
