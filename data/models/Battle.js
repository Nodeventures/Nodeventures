"use strict";

var mongoose = require('mongoose');

var battleSchema = new mongoose.Schema({
    heroId: {type: Number, required: true, index: true},
    otherHeroId: {type: Number, required: true, index: true},
    mapKey: {type: String, required: true, index: true}
});

var Battle = mongoose.model('Battle', battleSchema);

module.exports = Battle;