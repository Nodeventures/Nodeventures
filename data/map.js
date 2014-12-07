"use strict";

var q = require('q');
var Map = require('./models/Map');

module.exports = {
    createMap: function (mapInfo) {
        var defer = q.defer();
        Map.create(mapInfo, function (err, map) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(map);
            }
        });

        return defer.promise;
    },
    loadMapByKey: function (key) {

        var defer = q.defer();

        // TODO: load data from maps collection
        defer.resolve({
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
            },

            // TODO: load all heros that have position.map === key && status === 'online'
            onlineHeroes: [],


            // TODO: this array should contain all items on the current map
            // this can be built from the map.mapObjects (only type of 'item') field of the map model (resolving the relationship)
            // example item added
            itemsOnMap: [{
                type: 'sword',
                key: 'great-sword-of-awesomeness',
                description: 'The greatest and most awesome sword.',

                modifiers: {
                    health: 0,
                    attack: 2,
                    defense: 0
                },

                // TODO: this is taken from the map.items entry matching the itemId
                position: {
                    x: 120,
                    y: 230
                }
            }]
        });

        return defer.promise;
    },
};