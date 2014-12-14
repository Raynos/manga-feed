# http-access-log

A simple access log helper to write access logs for HTTP requests

## Example

```js
var accessLog = require('http-access-log');
var http = require('http');

var server = http.createServer();
// make sure access log is the first request listener.
server.on('request', accessLog(console.log));

server.on('request', function hello(req, res) {
    res.end('hello world');
});

server.listen(3000);
```
