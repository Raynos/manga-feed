'use strict';

var test = require('tape');
var genericSession = require('generic-session');

var hammockRequest = require('../../../lib/hammock-request/');
var register = require('../register.js');

function MockUser() {
    return {
        register: function register(user, cb) {
            cb(null, {
                email: user.email
            });
        }
    };
}

function MockSession() {
    var store = genericSession.MemoryStore();

    return function createSession(req, res) {
        return genericSession(req, res, store);
    };
}

function allocRegister(mocks) {
    mocks = mocks || {};
    var opts = {
        clients: {
            session: mocks.session || MockSession()
        },
        services: {
            user: mocks.user || MockUser()
        }
    };

    return function handler(req, res) {
        register(req, res, opts);
    };
}

test('can register', function t(assert) {
    var handler = allocRegister();

    hammockRequest(handler, {
        url: '/register',
        json: {
            email: 'foo@bar.com',
            confirmEmail: 'foo@bar.com',
            password: 'foobar123'
        }
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body.email, 'foo@bar.com');

        assert.end();
    });
});

test('errors if register when logged in', function t(assert) {
    var handler = allocRegister();
    var jar = hammockRequest.jar();

    hammockRequest(handler, {
        url: 'http://localhost/register',
        json: {
            email: 'foo@bar.com',
            confirmEmail: 'foo@bar.com',
            password: 'foobar123'
        },
        jar: jar
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);

        hammockRequest(handler, {
            url: 'http://localhost/register',
            json: {
                email: 'foo@bar.com',
                confirmEmail: 'foo@bar.com',
                password: 'foobar123'
            },
            jar: jar
        }, function onResponse2(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 400);
            assert.equal(resp.body.type,
                'user-register.already-logged-in');

            assert.end();
        });
    });
});
