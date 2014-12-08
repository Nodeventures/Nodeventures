"use strict";

var mongoose = require('mongoose');

// auto increment is used for the current hero id
var autoIncrement = require('mongoose-auto-increment');

// If we have more different kind of heroes can add type.
// Different heroes will start with different health, attack and defense points.
var heroSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, index: true},
    status: {type: String, required: true, index: true, default: 'offline'},
    position: {
        x: {type: Number, default: 320},
        y: {type: Number, default: 320},
        map: {type: String, default: 'fields'}
    },
    currentHealth: {type: Number, required: true, default: 100},
    health: {type: Number, required: true, default: 100},
    attack: {type: Number, required: true, default: 1},
    defense: {type: Number, required: true, default: 0},
    userId: {type: mongoose.Schema.ObjectId, ref: 'User'},
    heroSprite: {type: String, default: 'assets/tileset/space_guy.png'},
    animations: {
        idle: {type: [[Number]], default: [[1, 2], [1, 2]]},
        walk: {type: [[Number]], default: [[0, 2], [1, 2], [2, 2]]}
    },
    id: Number,
    items: [String]
}, {
    collection: 'heroes',
    id: false
});

// configure autoIncrement to increment id by 1
heroSchema.plugin(autoIncrement.plugin, {
    model: 'Hero',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

var Hero = mongoose.model('Hero', heroSchema);

module.exports = Hero;