var test = require('tape');

var mangaFeed = require('../index.js');

test('mangaFeed is a function', function (assert) {
    assert.equal(typeof mangaFeed, 'function');
    assert.end();
});
