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
                id: heroInfo.id,
                status: heroInfo.status
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

function updateHeroStats(hero, statsToAdd, defer) {
    var heroIsAtFullHealth = hero.health === hero.currentHealth;
    var heroHealthReduced = hero.health < hero.currentHealth;

    hero.health += statsToAdd.health;
    hero.attack += statsToAdd.attack;
    hero.defense += statsToAdd.defense;

    if (heroIsAtFullHealth) {
        hero.currentHealth += statsToAdd.health;
    }
    else if (heroHealthReduced) {
        hero.currentHealth = hero.health;
    }

    hero.save(function (err, heroSaved) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(heroSaved);
        }
    });
}

module.exports = {
    createHero: function (heroInfo) {
        // heroInfo - username, name, status.
        var defer = q.defer();

        var self = this;
        // if the hero is already created, return the hero from database
        // either way create new hero
        this.findByName(heroInfo.name)
            .then(function (hero) {
                if (hero) {
                    self.setHeroStatus(hero.id, heroInfo.status)
                        .then(function () {
                            defer.resolve(hero);
                        });
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
    },
    findById: function (heroId) {
        var defer = q.defer();

         Hero.findOne()
            .where('id').equals(heroId)
            .exec(function (err, hero) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(hero);
                }
            });

        return defer.promise;
    },
    updateHeroPosition: function (heroId, newPosition) {
        var defer = q.defer();

        Hero.findOneAndUpdate({id: heroId}, {'position.x': newPosition.x, 'position.y': newPosition.y}, function (err, numberAffected, raw) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });

        return defer.promise;
    },
    setHeroStatus: function (heroId, status) {
        // eventdata: username, hero_id

        var defer = q.defer();

        Hero.findOneAndUpdate({id: heroId}, {status: status}, function (err, numberAffected, raw) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });

        return defer.promise;
    },
    updateHeroStatsWith: function (heroId, statsToAdd) {
        // statsToAdd: health, attack, defense
        var defer = q.defer();

        Hero.findOne()
            .where('id').equals(heroId)
            .exec(function (err, hero) {
                if (err) {
                    defer.reject(err);
                } else if (hero) {
                    updateHeroStats(hero, statsToAdd, defer);
                } else {
                    defer.reject({message: 'There is no such hero in the database.'});
                }
            });

        return defer.promise;
    },
    findOnlineHeroesForMap: function (mapKey) {
        var defer = q.defer();

        Hero.find()
            .where('status').equals('online')
            .where('position.map').equals(mapKey)
            .exec(function (err, heroes) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(heroes);
                }
            });

        return defer.promise;
    },
    setHeroMapPosition: function (heroId, newMapKey) {
        var defer = q.defer();

        Hero.findOneAndUpdate({id: heroId}, {'position.map': newMapKey}, function (err, numberAffected, raw) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });

        return defer.promise;

    },

    addItemToBackpack: function (heroId, itemKey) {
        var defer = q.defer();

        Hero.findOneAndUpdate({id: heroId}, {$addToSet: {inventoryItems: itemKey}}, function (err, numberAffected, raw) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });

        return defer.promise;

    },

    dropItem: function (heroId, itemKey) {
        var defer = q.defer();

        Hero.findOneAndUpdate({id: heroId}, {$pull: {inventoryItems: itemKey}}, function (err, numberAffected, raw) {
            if (err) {
                defer.reject(err);
            }
            else {
                defer.resolve();
            }
        });

        return defer.promise;
    }
};