"use strict";

var q = require('q');
var Item = require('./models/Item');

module.exports = {
    createItem: function (itemInfo) {
        var defer = q.defer();

        Item.create(itemInfo, function (err, item) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(item);
            }
        });

        return defer.promise;
    },
    getItemByKey: function (itemKey) {
        var defer = q.defer();

        Item.findOne()
            .where('key').equals(itemKey)
            .exec(function (err, item) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(item);
                }
            });

        return defer.promise;
    },
    getItemsByType: function (type) {
        var defer = q.defer();

        Item.find()
            .where('type').equals(type)
            .exec(function (err, items) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(items);
                }
            });

        return defer.promise;
    }
};