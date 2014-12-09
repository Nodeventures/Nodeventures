var utils = require('./utils'),
    defaultChannel = '/system',
    Q = require('q'),
    _ = require('underscore');

var data = require('../../data');

function loadMapByKey(key) {
    var defer = Q.defer();

    data.map.findMapByKey(key)
        .then(function(map){

            map = map.toObject();

            var obstacles = require('../../data/gameObjects/obstacles.json');
            var compatibleObstacles = obstacles[key];

            map.obstacles = _.map(map.obstacles, function(obstacle){
                obstacle = _.extend(obstacle, compatibleObstacles[obstacle.name]);
                return obstacle;
            });

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
                            var itemsOnMap = [];
                            items.forEach(function(item){
                                var positionData = _.find(map.mapObjects, function(obj){
                                    return obj.type === 'item' && obj.itemId === item.key;
                                });

                                var builtItem = item.toObject();
                                builtItem.position = positionData.position;

                                itemsOnMap.push(builtItem);
                            });

                            map.itemsOnMap = itemsOnMap;
                        });
                })
                .fail(function(err){
                    defer.reject(err);
                })
                .done(function(){
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
            eventData.hero = createdHero.toObject();
            return data.item.findItemsByKeys(eventData.hero.inventoryItems);
        })

        .then(function(items){
            eventData.hero.inventory = items;
            return data.battle.getBattlesOnMap(eventData.hero.position.map);
        })

        .then(function(battles){
            eventData.battles = battles;
            return loadMapByKey(eventData.hero.position.map);
        })

        // load map based on hero position
        .then(function(map){
            // copy object so that we can attach and access attached properties
            eventData.map = map;

            eventData.areas = _.filter(map.mapObjects, function(mapObject){
                return mapObject.type === 'building';
            });
        })

        // forward any errors back
        .fail(function(error){
            errorEncountered = error;
            deferred.reject(error);
        })

        // return event
        .done(function(){

            if (!errorEncountered) {
                // mark images / assets that need loading
                eventData.images = {
                    "heroSprite": eventData.hero.heroSprite,
                    "tileSet": eventData.map.tileSet
                };

                // load item images
                eventData.map.itemsOnMap.forEach(function(item){
                    eventData.images[item.key] = 'assets/items/' + item.image;
                });

                // load area images
                eventData.areas.forEach(function(area){
                    eventData.images[area.image] = 'assets/buildings/' + area.image;
                });

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