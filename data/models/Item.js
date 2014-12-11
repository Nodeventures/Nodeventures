"use strict";

var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    // item has type, for example weapon, and the key will be the item name (example: sword, axe, etc.)
    type: {type: String, required: true, index: true},
    key: {type: String, required: true, unique: true, index: true},
    name: String,
    description: String,
    image: String,
    // the modifiers for hero stats change after item is picked up
    modifiers: {
        health: {type: Number, default: 0},
        attack: {type: Number, default: 0},
        defense: {type: Number, default: 0},
        currentHealth: {type: Number, default: 0}
    },

    useable: {type: Boolean, default: false},
    uses: {type:Number, default: 0}
});

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;