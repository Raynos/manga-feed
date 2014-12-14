# test-server-request

A helper to make requests against a server.

## Example

```js
// my-test.js
var test = require('tape');
var makeRequest = require('test-server-request');

var App = require('../app.js');

/* custom app specific logic to spin up your http server.
    Remember to hook custom destroy into http server close.
    probably put this function in a single place.
*/
function allocServer(callback) {
    App.createServer(function (err, app) {
        if (err) {
            return callback(err);
        }

        var server = app.httpServer;
        var $close = server.close;
        server.close = function fakeClose() {
            app.destroy();
            return $close.apply(this, arguments);
        }

        callback(null, server);
    })
}

test('make a request', function t(assert) {
    makeRequest(allocServer, {
        url: '/health'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'OK');

        assert.end();
    });
});
```
