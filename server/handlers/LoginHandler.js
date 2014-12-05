var utils = require('./utils'),
    defaultChannel = '/system';

var data = require('../../data');

var onUserLogin = utils.wrapWithPromise(function (gameEvent, deferred) {
    // eventData: username, password

    console.log('User logged in or is registering', gameEvent);

    data.user.registerUser(gameEvent.data)
        .then(function (registeredUser) {
            data.hero.createHero({
                username: registeredUser.username,
                name: registeredUser.username
            }).then(function (createdHero) {
                console.log(createdHero);
                // fill out what you can from the database
                var eventData = {

                    // load user data from db
                    user: {
                        username: registeredUser.username
                    },

                    // all images that need to be loaded before the scene is initialized
                    images: {
                        heroSprite: "assets/tileset/space_guy.png",
                        tileSet: "assets/tileset/free_tileset_CC.png",
                    },

                    // hero information
                    hero: createdHero,

                    // map object loaded based on hero's position.map field
                    map: {
                        key: 'fields',

                        tileSize: 32,
                        tileSet: "assets/tileset/free_tileset_CC.png",
                        width: 640,
                        height: 640,

                        tilesConfig: {
                            imageX: 5,
                            imageY: 18,
                            stepsHorizontalAllowed: 2,
                            stepsVerticalAllowed: 2,
                        }
                    }
                };

                // send event to clients
                deferred.resolve(utils.createGameEvent(defaultChannel, 'userLoggedIn', eventData));
            }).fail(function (err) {
                deferred.reject(err);
            });
        })
        .fail(function (err) {
            deferred.reject(err);
        });
});

var onUserLogout = utils.wrapWithPromise(function (gameEvent, deferred) {
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