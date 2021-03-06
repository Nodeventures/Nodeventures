"use strict";

var q = require('q');
var Battle = require('./models/Battle');

module.exports = {
    getBattlesOnMap: function(mapKey) {
        var defer = q.defer();

        Battle.find({
            mapKey: mapKey
        }, function(err, battles) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(battles);
            }
        });

        return defer.promise;
    },

    startBattleOnMap: function(battleInfo, mapKey) {
        var defer = q.defer();

        battleInfo.mapKey = mapKey;

        Battle.create(battleInfo, function(err, battle) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(battle);
            }
        });

        return defer.promise;
    },

    cancelBattleByCombatant: function(heroId) {
        var defer = q.defer();

        Battle.remove({$or : [{heroId: heroId}, {otherHeroId: heroId}]}, function(err) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve();
            }
        });

        return defer.promise;
    }
};