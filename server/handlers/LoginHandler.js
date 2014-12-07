var utils = require('./utils'),
    defaultChannel = '/system';

var data = require('../../data');

var onUserLogin = utils.wrapWithPromise(function (gameEvent, deferred) {
    // eventData: username, password

    console.log('User logged in or is registering', gameEvent);

    var eventData = {};
    data.user.registerUser(gameEvent.data)

        // get user object
        .then(function(registeredUser){
            eventData.user = {
                username: registeredUser.username
            };

            return data.hero.createHero({
                username: registeredUser.username,
                name: registeredUser.username,
                status: 'online'
            });
        })

        // get hero
        .then(function(createdHero){
            eventData.hero = createdHero;
            return data.map.loadMapByKey(createdHero.position.map);
        })

        // load map based on hero position
        .then(function(map){
            eventData.map = map;
        })

        // forward any errors back
        .catch(function(error){
            deferred.reject(error);
        })

        // return event
        .done(function(){

            // mark images / assets that need loading
            eventData.images = {
                "heroSprite": eventData.hero.heroSprite,
                "tileSet": eventData.map.tileSet
            };

            deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedIn', eventData));
        });
});

function sendLogoutEvent(gameEvent, deferred) {
    console.log('User logged out', gameEvent);
    // notify other clients that user has logged out
    deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedOut', gameEvent.data));
}

var onUserLogout = utils.wrapWithPromise(function (gameEvent, deferred) {

    // eventData: username, hero_id
    data.hero.setHeroStatus(gameEvent.data.hero_id, 'offline')
        .fail(function(err){
            // logout user anyway
            sendLogoutEvent(gameEvent, deferred);
        })
        .done(function(){
            // notify other clients that user has logged out
            sendLogoutEvent(gameEvent, deferred);
        });
    
});

module.exports = {
    onUserLogin: onUserLogin,
    onUserLogout: onUserLogout
};