# http-hash-router

A simple router module for your HTTP server. Backed by
    `http-hash`.

## Example

```js
var http = require('http');
var HttpHashRouter = require('http-hash-router');

var router = HttpHashRouter();

router.set('/health', function health(req, res) {
    res.end('OK');
});

var server = http.createServer(router);
server.listen(3000);
```
