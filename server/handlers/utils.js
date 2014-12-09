var Q = require('q');

function createGameEvent(channel, key, data) {
    return {
        channel: channel,
        key: key,
        data: data
    };
}

function designateEventSocket(gameEvent, socket) {
    gameEvent.socket = socket;
    return gameEvent;
}

function wrapWithPromise(callback) {

    return function(gameEvent, clientSocket) {

        var deferred = Q.defer();

        callback(gameEvent, deferred, clientSocket);

        return deferred.promise;

    };

}

module.exports = {

    createGameEvent: createGameEvent,

    wrapWithPromise: wrapWithPromise,

    designateEventSocket: designateEventSocket
    
};