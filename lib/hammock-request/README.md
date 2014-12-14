# hammock-request

Make requests use the hammock HTTP mocks

## Example

```js
var hammockRequest = require('hammock-request');

var myHandler = function (req, resp) {
    resp.end(JSON.stringify('hello world'));
}

hammockRequest(handler, {
    url: '/foo',
    json: { 'foo': 'bar' }
})
```
