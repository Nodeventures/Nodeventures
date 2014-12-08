"use strict";

var mongoose = require('mongoose');

var mapObjectSchema = new mongoose.Schema({
    type: String,
    itemId: String,
    position: {
        x: Number,
        y: Number
    }
});

var MapObject = mongoose.model('MapObject', mapObjectSchema);

var mapSchema = new mongoose.Schema({
    key: {type: String, unique: true, index: true},
    width: {type: Number, default: 640},
    height: {type: Number, default: 640},
    tileSize: {type: Number, default: 32},
    tileSet: {type: String, default: 'assets/tileset/free_tileset_CC.png'},

    tilesConfig: {
        imageX: {type: Number, default: 5},
        imageY: {type: Number, default: 18},
        stepsHorizontalAllowed: {type: Number, default: 2},
        stepsVerticalAllowed: {type: Number, default: 2}
    },

    mapObjects: { type: Object, default: [] },

    // filled at runtime
    // need to be added because Mongoose does not allow to add properties on runtime
    // schema is compiled much before that
    onlineHeroes: [{}],
    itemsOnMap: [{}],

}); 

var Map = mongoose.model('Map', mapSchema);

module.exports = Map;