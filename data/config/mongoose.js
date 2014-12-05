"use strict";

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var models;

module.exports = function (config) {
    mongoose.connect(config.db);
    autoIncrement.initialize(mongoose.connection);

    models = require('../models').Hero;

    var db = mongoose.connection;

    db.once('open', function (err) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        console.log('Database up and running...');
    });

    db.on('error', function (err) {
        console.log('Database error: ' + err);
    });
};