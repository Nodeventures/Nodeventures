var utils = require('./utils'),
    defaultChannel = '/system',
    Q = require('q'),
    _ = require('underscore');

var data = require('../../data');

function loadMapByKey(key) {
    var defer = Q.defer();

    data.map.findMapByKey(key)
        .then(function(map){

            // load online heroes
            data.hero.findOnlineHeroesForMap(key)
                .then(function(heroes){

                    map.onlineHeroes = heroes;
                    var itemIds = _.chain(map.mapObjects).filter(function(mapObject){
                        return mapObject.type === 'item';
                    }).pluck('itemId').value();

                    // load items on map
                    return data.item.findItemsByKeys(itemIds)
                        .then(function(items){

                            // load items
                            map.itemsOnMap = [];
                            items.forEach(function(item){
                                var positionData = _.find(map.mapObjects, function(obj){
                                    return obj.type === 'item' && obj.itemId === item.id;
                                });

                                item.position = positionData.position;

                                map.itemsOnMap.push(item);
                            });
                        });
                })
                .fail(function(err){
                    console.log('error', err);
                    defer.resolve(err);
                })
                .done(function(){
                    console.log('MAP', map);
                    defer.resolve(map);
                });
        });

    return defer.promise;
}

var onUserLogin = utils.wrapWithPromise(function (gameEvent, deferred) {
    // eventData: username, password

    var eventData = {},
        errorEncountered = null;
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
            return loadMapByKey(createdHero.position.map);
        })

        // load map based on hero position
        .then(function(map){
            eventData.map = map;
        })

        // forward any errors back
        .fail(function(error){
            errorEncountered = error;
            deferred.reject(error);
        })

        // return event
        .done(function(){
            // console.log(eventData);
            if (!errorEncountered) {
                // mark images / assets that need loading
                eventData.images = {
                    "heroSprite": eventData.hero.heroSprite,
                    "tileSet": eventData.map.tileSet
                };

                deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedIn', eventData));
            }
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