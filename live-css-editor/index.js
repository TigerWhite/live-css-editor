#!/usr/bin/env node

/* eslint-env node */

var chokidar = require('chokidar');
var express = require('express');
var Emitter = require('tiny-emitter');

var emitter = new Emitter();
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


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
        ignoreInitial: true,
        persistent: true
    }
);

watcher.on('ready', function () {
    var watchedPaths = watcher.getWatched();
    log('**********Watched paths**********');
    log(watchedPaths);
});

var fileModifiedHandler = function (changeObj) {
    console.log(changeObj.fileName);
    io.emit('file-modified', changeObj);
};
var fileAddedHandler = function (changeObj) {
    console.log(changeObj.fileName);
    io.emit('file-added', changeObj);
};
var fileDeletedHandler = function (changeObj) {
    console.log(changeObj.fileName);
    io.emit('file-deleted', changeObj);
};

emitter.on('file-modified', fileModifiedHandler);
emitter.on('file-added', fileAddedHandler);
emitter.on('file-deleted', fileDeletedHandler);

watcher
    .on('add', function (path) {
        log(`File ${path} has been added`);
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
    console.log('a user connected');

    // socket.on('chat message', function(msg){
    //     console.log('message: ' + msg);
    // });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
