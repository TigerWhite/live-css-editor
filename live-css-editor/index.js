#!/usr/bin/env node

/* eslint-env node */

var chokidar = require('chokidar');
var express = require('express');
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
        'node_modules/async-limiter/coverage/lcov-report/base.css',

        '**/*.css',
        '**/*.css.*',

        '**/*.less',
        '**/*.less.*',

        '**/*.sass',
        '**/*.sass.*',

        '**/*.scss',
        '**/*.scss.*'
    ],
    {
        ignored: [
            '!node_modules/async-limiter/coverage/lcov-report/base.css',
            'node_modules'
        ],
        // ignored: /(^|[/\\])\../,
        persistent: true
    }
);

var watchedPaths = watcher.getWatched();
log(watchedPaths);

watcher
    .on('add', path => log(`File ${path} has been added`))
    .on('change', function (path) {
        log(`File ${path} has been changed`);
        io.emit('file-modified', { fileName: path });
    })
    .on('unlink', path => log(`File ${path} has been removed`));

io.on('connection', function(socket) {
    console.log('a user connected');

    // socket.on('chat message', function(msg){
    //     console.log('message: ' + msg);
    // });

    io.emit('file-modified', { fileName: 'abc.css' });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
