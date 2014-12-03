// This object is responsible for attaching event handlers when a new socket is created

var async = require('async'),
    util = require('util');

function emitEvents(io, events) {
    events.forEach(function(gameEvent){
        io.of(gameEvent.channel).emit(gameEvent.key, gameEvent.data);
    });
}

function mapHandlersToSocket(io, channelSocket, eventKey, handlers) {
    channelSocket.on(eventKey, function(data){
        // get arraay of handler functions for this message key
        handlers = util.isArray(handlers) ? handlers : [handlers];

        // wrap handler functions for async
        var callbacks = handlers.map(function(handlerFunction){

            // create async callback function
            return function(asyncCallback) {

                // call handler function and on success call the async callback
                handlerFunction(data).done(function(responseEvent){
                    asyncCallback(null, responseEvent);
                });
            };
        });

        async.parallel(callbacks, function(err, eventsToFire){
            emitEvents(io, eventsToFire);
        });
    });
}

function addMappings(io, channelSocket, mappings) {
    Object.keys(mappings).forEach(function(eventKey){
        var eventMappings = mappings[eventKey];
        mapHandlersToSocket(io, channelSocket, eventKey, eventMappings);
    });
}

module.exports = function(io) {

    return {

        // get socket.io namespace
        forChannel: function(channel) {
            var channelSocket = io.of(channel);

            return {

                // add mappings for namespace
                addMappings: function(mappings) {
                    channelSocket.on('connection', function(socket){
                        console.log('Client connected to channel: ' + channel);
                        addMappings(io, socket, mappings);
                    });
                }

            };

        }

    };
};