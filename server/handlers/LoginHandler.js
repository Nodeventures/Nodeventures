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
                            var itemsKeyMap = {};

                            // create map for easy access
                            _.each(map.mapObjects, function(obj){
                                if (obj.type === 'item') {
                                    itemsKeyMap[obj.itemId] = obj;
                                }
                            });

                            items.forEach(function(item){
                                var mapObject = itemsKeyMap[item.key];

                                if (mapObject) {
                                    var chanceToAppear = mapObject.chanceToAppear || 0.2,
                                        randomNumber = _.random(0, 100),
                                        rolledChance = randomNumber / 100,
                                        hasSpawned = rolledChance <= chanceToAppear;

                                    if (hasSpawned) {
                                        var builtItem = item.toObject();
                                        builtItem.position = mapObject.position;

                                        itemsOnMap.push(builtItem);
                                    }
                                }
                                
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

function loadAreaData(promise) {
    var defer = Q.defer();

    var eventData = {},
        errorEncountered = null;

    promise
        .then(function(hero){
            eventData.hero = hero.toObject();
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
        .then(function(){

            if (!errorEncountered) {
                // mark images / assets that need loading
                eventData.images = {
                    "tileSet": 'assets/images/tileset/' + eventData.map.tileSet
                };

                eventData.images[eventData.hero.heroSprite] = 'assets/images/heroes/' + eventData.hero.heroSprite;

                // load online hero sprites
                _.each(eventData.map.onlineHeroes, function(hero){
                    eventData.images[hero.heroSprite] = 'assets/images/heroes/' + hero.heroSprite;
                });

                // load item images
                eventData.map.itemsOnMap.forEach(function(item){
                    eventData.images[item.key] = 'assets/images/items/' + item.image;
                });

                // load area images
                eventData.areas.forEach(function(area){
                    eventData.images[area.image] = 'assets/images/buildings/' + area.image;
                });

                defer.resolve(eventData);
            }
        });

    return defer.promise;
}

var onUserLogin = utils.wrapWithPromise(function (gameEvent, deferred) {
    // eventData: username, password

    var eventData = {};

    var registerUserPromise = data.user.registerUser(gameEvent.data)

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
        .fail(function(err){
            deferred.reject(err);
        });

    loadAreaData(registerUserPromise)
        .done(function(data){
            eventData = _.extend(eventData, data);
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

var onAreaChanged = utils.wrapWithPromise(function (gameEvent, deferred, clientSocket) {
    // eventData: heroId, mapKey
    
    // load new map for hero and send back to him
    // forward event to other clients to remove from maps
    // send event to show user on new map

    var eventData = {};
    var events = [];

    var heroPromise = data.hero.setHeroMapPosition(gameEvent.data.heroId, gameEvent.data.mapKey)

        // get user object
        .then(function(){
            return data.hero.findById(gameEvent.data.heroId);
        })
        .fail(function(err){
            deferred.reject(err);
        });

    loadAreaData(heroPromise)
        .done(function(data){
            data.user = {
                username: data.hero.name
            };

            // event to remove user from all areas
            events.push(utils.createGameEvent(defaultChannel, 'userLoggedOut', {
                'username': data.user.username,
                'hero_id': data.hero.id
            }));

            // event to login user to target area
            var loginEvent = utils.createGameEvent(defaultChannel, 'userLoggedIn', data);
            // narrowedLoginEvent = utils.designateEventSocket(loginEvent, clientSocket);
            events.push(loginEvent);
            deferred.resolve(events);
        });
    
});

module.exports = {
    onUserLogin: onUserLogin,
    onUserLogout: onUserLogout,
    onAreaChanged: onAreaChanged
};