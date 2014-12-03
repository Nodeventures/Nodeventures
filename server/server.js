var http = require('http');
var express = require('express');

var app = express();

var server = http
    .createServer(app)
    .listen(8080, function () {
        console.log('Express server listening on port ' + server.address().port);
    });

var io = require('socket.io')(server);
var eventEngine = require('./eventEngine')(io);

// add event mappings
require('./eventMappings/movement')(eventEngine);