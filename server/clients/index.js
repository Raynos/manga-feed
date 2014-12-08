'use strict';

var parallel = require('run-parallel');
var process = require('process');
var uncaughtException = require('uncaught-exception');
var Logtron = require('logtron');
var level = require('level');
var levelSublevel = require('level-sublevel');
var LevelStore = require('level-session/level-store');
var genericSession = require('generic-session');

module.exports = createClients;

function createClients(config, callback) {
    var clients = {};

    parallel([
        createLogger.bind(null, config, clients),
        createUncaught.bind(null, config, clients),
        createDatabase.bind(null, config, clients),
        createSession.bind(null, config, clients)
    ], onClients);

    function onClients(err) {
        clients.destroy = destroy;
        callback(err, clients);
    }

    function destroy() {
        clients.level.close();
        clients.session.destroy();
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

function createDatabase(config, clients, cb) {
    var conf = config.get('clients.level');
    var db = level(conf.location, {});
    db = levelSublevel(db);
    clients.level = db;

    return process.nextTick(cb);
}

function createSession(config, clients, cb) {
    var conf = config.get('clients.level-session');

    var sessionDB = clients.level.sublevel(conf.subName);
    var store = LevelStore({
        db: sessionDB
    });
    clients.session = allocSession;
    clients.session.destroy = destroy;

    return process.nextTick(cb);

    function allocSession(req, res) {
        return genericSession(req, res, store);
    }

    function destroy() {
        store.close();
    }
}
