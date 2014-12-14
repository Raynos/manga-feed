'use strict';

module.exports = accessLog;

function accessLog(logger) {
    return function logRequest(req, res) {
        var start = Date.now();
        res.on('finish', function onFinish() {
            logger('a request was made', {
                statusCode: res.statusCode,
                time: Date.now() - start,
                uri: req.url,
                host: req.headers.host,
                method: req.method
            });
        });
    };
}
