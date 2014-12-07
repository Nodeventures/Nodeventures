"use strict";

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var models;
var itemSeeder = require('../seeds/item');

module.exports = function (config) {
    mongoose.connect(config.db);
    autoIncrement.initialize(mongoose.connection);

    models = require('../models');

    var db = mongoose.connection;

    db.once('open', function (err) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        itemSeeder.seedItems(db.collections.items.collection)
            .then(function (results) {
                console.log(results);
            })
            .fail(function (err) {
                console.log('Error: ' + err);
            })
            .done(function () {
                console.log('Done seeding items.');
            });

        console.log('Database up and running...');
    });

    db.on('error', function (err) {
        console.log('Database error: ' + err);
    });
};