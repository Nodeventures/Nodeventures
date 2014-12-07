"use strict";

var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    // item has type, for example weapon, and the key will be the item name (example: sword, axe, etc.)
    type: {type: String, required: true},
    key: {type: String, required: true, unique: true, index: true},
    name: String,
    description: String,
    image: String,
    // the modifiers for hero stats change after item is picked up
    modifiers: {
        health: {type: Number, required: true},
        attack: {type: Number, required: true},
        defense: {type: Number, required: true}
    }
});

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;