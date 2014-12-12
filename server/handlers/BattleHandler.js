var utils = require('./utils'),
    defaultChannel = '/battle',
    data = require('../../data'),
    _ = require('underscore');

var onHeroAttacked = utils.wrapWithPromise(function(gameEvent, deferred) {
    // eventData: attacker, defender

    var events = [];

    // 1. get attacker hero by id
    // 2. get defender hero by id
    // 3. calculate damage
    // 4. update defender stats

    data.hero.findById(gameEvent.data.attacker)
        .then(function(attacker) {
            return data.hero.findById(gameEvent.data.defender)
                .then(function(defender) {

                    var attackDamage = _.random(Math.ceil(attacker.attack * 2 / 3), attacker.attack);

                    attackDamage = Math.max(0, attackDamage - defender.defense);

                    // attack defender
                    var damagedStats = {
                        currentHealth: -attackDamage
                    };

                    gameEvent.data.attackerName = attacker.name;
                    gameEvent.data.defenderName = defender.name;
                    gameEvent.data.attackDamage = attackDamage;
                    events.push(gameEvent);

                    if (attackDamage >= defender.currentHealth) {
                        events.push(utils.createGameEvent(defaultChannel, 'heroDied', {
                            killerId: attacker.id,
                            deceasedId: defender.id
                        }));

                        // heal to full
                        damagedStats.currentHealth = defender.health - defender.currentHealth;
                    }

                    return data.hero.updateHeroStatsWith(defender.id, damagedStats)
                        .then(function(hero) {
                            var newStats = _.pick(hero.toObject(), ['attack', 'defense', 'health', 'currentHealth']);
                            newStats.id = hero.id;
                            events.push(utils.createGameEvent('/hero', 'heroStatsChanged', newStats));
                        })
                        .fail(function(err) {
                            deferred.reject(err);
                        });
                });
        })
        .fail(function(err) {
            deferred.reject(err);
        })
        .done(function() {
            // send event to clients
            deferred.resolve(events);
        });
});

var onHeroFled = utils.wrapWithPromise(function(gameEvent, deferred) {
    // eventData: fleeingHero

    data.battle.cancelBattleByCombatant(gameEvent.data.fleeingHero)
        .fail(function(err) {
            deferred.reject(err);
        })
        .then(function() {
            // event is already forwarded -> no need to resend it
            deferred.resolve();
        });
});

var onHeroDied = utils.wrapWithPromise(function(gameEvent, deferred) {
    // eventData: deadHeroId

    data.battle.cancelBattleByCombatant(gameEvent.data.deadHeroId)
        .fail(function(err) {
            deferred.reject(err);
        })
        .then(function() {
            // event is already forwarded -> no need to resend it
            deferred.resolve();
        });
});

var onBattleStarted = utils.wrapWithPromise(function(gameEvent, deferred) {
    // eventData: otherHeroId, heroId, firstAttacker

    var battleInfo = {
        heroId: gameEvent.data.heroId,
        otherHeroId: gameEvent.data.otherHeroId
    };

    data.battle.startBattleOnMap(battleInfo, gameEvent.data.mapKey)
        .fail(function(err) {
            deferred.reject(err);
        })
        .then(function() {
            // event is already forwarded -> no need to resend it
            deferred.resolve();
        });
});

module.exports = {
    onHeroAttacked: onHeroAttacked,
    onBattleStarted: onBattleStarted,
    onHeroFled: onHeroFled,
    onHeroDied: onHeroDied
};