var utils = require('./utils'),
    defaultChannel = '/system';

var onUserLogin = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: username, password
        
    console.log('User logged in or is registering', gameEvent);

    // TODO: login or register user and return user/hero data in event
    var data = {
        // all required user and hero data from database
    };
    
    // send event to clients
    deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedIn', data));
});

var onUserLogout = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: username, hero_id
        
    // TODO
    console.log('User logged out', gameEvent);

    // notify other clients that user has logged out
    deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedOut', gameEvent.data));
});

module.exports = {
    onUserLogin: onUserLogin,
    onUserLogout: onUserLogout
};