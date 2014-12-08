'use strict';

var parallel = require('run-parallel');
var process = require('process');
var uncaughtException = require('uncaught-exception');
var Logtron = require('logtron');

module.exports = createClients;

function createClients(config, callback) {
    var clients = {};

    parallel([
        createLogger.bind(null, config, clients),
        createUncaught.bind(null, config, clients),
        createDatabase.bind(null, config, clients)
    ], onClients);

    function onClients(err) {
        callback(err, clients);
    }
}

function createLogger(config, clients, cb) {
    var conf = config.get('clients.logtron');
    clients.logger = Logtron({
        meta: {
            team: config.get('team'),
            project: config.get('project')
        },
        backends: Logtron.defaultBackends({
            logFolder: conf.logFolder,
            console: conf.console
        })
    });
    return process.nextTick(cb);
}

function createUncaught(config, clients, cb) {
    var conf = config.get('clients.uncaught-exception');
    clients.onError = uncaughtException({
        logger: clients.logger,
        prefix: 'Uncaught exception occurred: ',
        backupFile: conf.backupFile
    });

    return process.nextTick(cb);
}
