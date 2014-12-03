var Q = require('q');

function createGameEvent(channel, key, data) {
    return {
        channel: channel,
        key: key,
        data: data
    };
}

function wrapWithPromise(callback) {

    return function(gameEvent) {

        var deferred = Q.defer();

        callback(gameEvent, deferred);

        return deferred.promise;

    };

}

module.exports = {

    createGameEvent: createGameEvent,

    wrapWithPromise: wrapWithPromise
    
};