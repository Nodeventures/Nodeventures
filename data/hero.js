"use strict";

var q = require('q');
var userData = require('./user');
var Hero = require('./models/Hero');

function processHeroCreate(heroInfo, defer) {
    userData.findByUsername(heroInfo.username)
        .then(function (user) {
            var newHero = {
                userId: user.id,
                name: heroInfo.name,
                id: heroInfo.id
            };

            Hero.create(newHero, function (err, createdHero) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(createdHero);
                }
            });
        })
        .fail(function (err) {
            defer.reject(err);
        });
}

module.exports = {
    createHero: function (heroInfo) {
        // heroInfo - username, name.
        var defer = q.defer();

        // if the hero is already created, return the hero from database
        // either way create new hero
        this.findByName(heroInfo.name)
            .then(function (hero) {
                if (hero) {
                    defer.resolve(hero);
                } else {
                    processHeroCreate(heroInfo, defer);
                }
            })
            .fail(function (err) {
                defer.reject(err);
            });

        return defer.promise;
    },
    findByName: function (heroName) {
        var defer = q.defer();

        if (heroName) {
            Hero.findOne()
                .where('name').equals(heroName)
                .exec(function (err, hero) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        defer.resolve(hero);
                    }
                });
        } else {
            defer.reject({message: 'You should provide username.'});
        }

        return defer.promise;
    }
};