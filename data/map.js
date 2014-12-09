"use strict";

var q = require('q');
var Map = require('./models/Map');
var _ = require('underscore');

module.exports = {
    createMap: function (mapInfo) {
        var defer = q.defer();
        Map.create(mapInfo, function (err, map) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(map);
            }
        });

        return defer.promise;
    },
    findMapByKey: function (key) {

        var defer = q.defer(),
            foundMap = null;

        Map.findOne()
            .where('key').equals(key)
            .exec(function (err, map) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(map);
                }
            });

        return defer.promise;
    },
};