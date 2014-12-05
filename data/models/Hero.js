"use strict";

var mongoose = require('mongoose');

// If we have more different kind of heroes can add type.
// Different heroes will start with different health, attack and defense points.
// Maybe should hold information about images
var heroSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    position: {
        x: Number,
        y: Number
    },
    health: {type: Number, required: true},
    attack: {type: Number, required: true},
    defense: {type: Number, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var Hero = mongoose.model('Hero', heroSchema);

module.exports = Hero;