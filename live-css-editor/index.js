#!/usr/bin/env node

/* eslint-env node */

var chokidar = require('chokidar');
var express = require('express');
var Emitter = require('tiny-emitter');
var chalk = require('chalk');

var emitter = new Emitter();
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// var verboseLogging = false;
var verboseLogging = true;

var connectedSessions = 0;

// app.get('/', function(req, res){
//     res.send('<h1>Hello world</h1>');
// });
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var log = console.log.bind(console);

var watcher = chokidar.watch(
    [
        '**/*.css',
        '**/*.css.*',

        '**/*.less',
        '**/*.less.*',

        '**/*.sass',
        '**/*.sass.*',

        '**/*.scss',
        '**/*.scss.*',

        // An example path which is required to be watched, but its parent folder is ignored
        // See below in this file: The path also needs to be "not" ignored in the "ignored" section
        'node_modules/async-limiter/coverage/lcov-report/base.css',
    ],
    {
        ignored: [
            /(^|[/\\])\../,     // A general rule to ignore the "." files/directories
            'node_modules',

            // An example path which is required to be watched, but its parent folder is ignored
            // See above in this file: The path also needs to be in the watchlist section
            '!node_modules/async-limiter/coverage/lcov-report/base.css'
        ],
        // ignored: /(^|[/\\])\../,
        // ignoreInitial: true,
        persistent: true
    }
);

var filesBeingWatched = 0;
var fileModifiedHandler = function (changeObj) {
    // console.log(changeObj.fileName);
    io.emit('file-modified', changeObj);
};
var fileAddedHandler = function (changeObj) {
    filesBeingWatched++;
    if (verboseLogging) {
        if (filesBeingWatched === 1) {
            console.log(chalk.green('Live CSS Editor (Magic CSS) is watching the following file(s):'));
        }
        console.log('    ' + changeObj.fileName);
    }
    io.emit('file-added', changeObj);
};
var fileDeletedHandler = function (changeObj) {
    // console.log(changeObj.fileName);
    filesBeingWatched--;
    io.emit('file-deleted', changeObj);
};

emitter.on('file-modified', fileModifiedHandler);
emitter.on('file-added', fileAddedHandler);
emitter.on('file-deleted', fileDeletedHandler);

emitter.on('file-watch-ready', function () {
    console.log(chalk.green('Live CSS Editor (Magic CSS) is watching ' + filesBeingWatched + ' files.'));
});

watcher.on('ready', function () {
    emitter.emit('file-watch-ready');
    // var watchedPaths = watcher.getWatched();
    // log('**********Watched paths**********');
    // log(watchedPaths);
});


var printSessionCount = function (connectedSessions) {
    console.log(chalk.blue('Number of active connections: ' + connectedSessions));
};

emitter.on('connected-socket', function () {
    connectedSessions++;
    console.log(chalk.blue('Connected to a socket.'));
    printSessionCount(connectedSessions);
});

emitter.on('disconnected-socket', function () {
    connectedSessions--;
    console.log(chalk.blue('Disconnected from a socket.'));
    printSessionCount(connectedSessions);
});

watcher
    .on('add', function (path) {
        // log(`File ${path} has been added`);
        emitter.emit('file-added', { fileName: path });
    })
    .on('change', function (path) {
        log(`File ${path} has been changed`);
        emitter.emit('file-modified', { fileName: path });
    })
    .on('unlink', function (path) {
        log(`File ${path} has been removed`);
        emitter.emit('file-deleted', { fileName: path });
    });

io.on('connection', function(socket) {
    emitter.emit('connected-socket');

    // socket.on('chat message', function(msg){
    //     console.log('message: ' + msg);
    // });

    socket.on('disconnect', function(){
        emitter.emit('disconnected-socket');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
