"use strict";

var mongoose = require('mongoose');

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

    mapObjects: {
        type: {type: String, default: 'item'}, // in the future in addition to item we will have 'area_entrance/exit'
        itemId: {type: mongoose.Schema.ObjectId, ref: 'Item'},
        position: {
            x: {type: Number, default: 320},
            y: {type: Number, default: 320},
        }
    }
});

var Map = mongoose.model('Map', mapSchema);

module.exports = Map;