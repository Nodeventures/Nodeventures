"use strict";

var mongoose = require('mongoose');

// If we have more different kind of heroes can add type.
// Different heroes will start with different health, attack and defense points.
var heroSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    position: {
        x: Number,
        y: Number,
        map: {type: String, default: 'fields'}
    },
    health: {type: Number, required: true, default: 100},
    attack: {type: Number, required: true, default: 0},
    defense: {type: Number, required: true, default: 0},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    heroSprite: {type: String, default: 'assets/tileset/space_guy.png'},
    animations: {
        idle: {type: [[Number]], default: [[1, 2]]},
        walk: {type: [[Number]], default: [[0, 2], [1, 2], [2, 2]]}
    }
});

var Hero = mongoose.model('Hero', heroSchema);

module.exports = Hero;