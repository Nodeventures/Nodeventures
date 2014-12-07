"use strict";

var async = require('async');
var q = require('q');

var allMaps = require('../../gameObjects/map');
var mapsData = require('../../map');

module.exports = {
    seedMaps: function (mapsCollection) {
        var defer = q.defer();
        var tasks = [];

        mapsCollection.count({}, function (err, mapsCount) {
            if (mapsCount === 0) {
                allMaps.forEach(function (mapInfo) {
                    tasks.push(function (callback) {
                        callback(null, mapsData.createMap(mapInfo));
                    });
                });

                async.series(tasks, function (err, results) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        defer.resolve(results);
                    }
                });
            }
        });

        return defer.promise;
    }
};
