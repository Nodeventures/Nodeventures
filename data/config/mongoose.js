"use strict";

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var models;
var seeds = require('../seeds');

module.exports = function(config) {
    mongoose.connect(config.db);
    autoIncrement.initialize(mongoose.connection);

    models = require('../models');

    var db = mongoose.connection;

    db.once('open', function(err) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        var seededCount = 0;
        seeds.items.seedItems(db.collections.items.collection)
            .then(function(items) {
                seededCount += items.length;
                if (items.length > 0) {
                    console.log('Seeded ' + items.length + ' items.');
                }
                return seeds.maps.seedMaps(db.collections.maps.collection);
            })
            .then(function(maps) {
                seededCount += maps.length;
                if (maps.length > 0) {
                    console.log('Seeded ' + maps.length + ' maps.');
                }
            })
            .fail(function(err) {
                console.log('Error: ' + err);
            })
            .done(function() {
                if (seededCount > 0) {
                    console.log('Done seeding.');
                }
            });

        console.log('Database up and running...');
    });

    db.on('error', function(err) {
        console.log('Database error: ' + err);
    });
};