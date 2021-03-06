var http = require('http');
var express = require('express');

// database configuration information
var config = require('../data/config/config')['development'];

var app = express();

var server = http
    .createServer(app)
    .listen(8080, function() {
        console.log('Game server listening on port ' + server.address().port);
    });

// initialize database
require('../data/config/mongoose')(config);

var io = require('socket.io')(server);
var eventEngine = require('./eventEngine')(io);

// add event mappings for different event types
require('./eventMappings/movement')(eventEngine);
require('./eventMappings/system')(eventEngine);
require('./eventMappings/items')(eventEngine);
require('./eventMappings/hero')(eventEngine);
require('./eventMappings/battle')(eventEngine);