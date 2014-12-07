"use strict";

var async = require('async');
var q = require('q');

var allItems = require('../../gameObjects/items');
var itemData = require('../../item');

module.exports = {
    seedItems: function (itemsCollection) {
        var defer = q.defer();
        var tasks = [];

        itemsCollection.count({}, function (err, itemsCount) {
           if(itemsCount === 0) {
               allItems.forEach(function (itemInfo) {
                   tasks.push(function (callback) {
                       callback(null, itemData.createItem(itemInfo));
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