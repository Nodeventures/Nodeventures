var utils = require('./utils'),
    defaultChannel = '/battle',
    data = require('../../data'),
    _ = require('underscore');

var onHeroAttacked = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: attacker, defender
    
    var events = [gameEvent];
    
    data.hero.findById(gameEvent.data.attacker)
        .then(function(attacker){
            return data.hero.findById(gameEvent.data.defender)
                .then(function(defender){
                    
                    // attack defender
                    var damagedStats = {
                        currentHealth: -attacker.attack
                    };

                    data.hero.updateHeroStatsWith(defender.id, damagedStats)
                        .then(function(hero){
                            var newStats = _.pick(hero.toObject(), ['attack', 'defense', 'health', 'currentHealth']);
                            newStats.id = hero.id;
                            events.push(utils.createGameEvent('/hero', 'heroStatsChanged', newStats));
                        })
                        .fail(function(err){
                            deferred.reject(err);
                        });
                    });
        })
        .fail(function(err){
            deferred.reject(err);
        })
        .done(function(){
            // send event to clients
            deferred.resolve(events);
        });
});

module.exports = {
    onHeroAttacked: onHeroAttacked,
};