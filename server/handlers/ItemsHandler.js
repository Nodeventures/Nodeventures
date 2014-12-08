var utils = require('./utils'),
    defaultChannel = '/items',
    data = require('../../data'),
    _ = require('underscore');


var onItemPickedUp = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: heroId, itemKey
        
    console.log('Handle item picked up event', gameEvent);
    // TODO: if hero has item -> reject
    // if hero overburdened -> reject
    // else add item id to hero and modify hero stats
    
    var events = [];
    
    data.item.getItemByKey(gameEvent.data.itemKey)
        .then(function(item){
            return data.hero.findById(gameEvent.data.heroId)
                .then(function(hero){
                    if (hero.inventoryItems.indexOf(item.key) !== -1) {
                        throw 'You already have this item';
                    }

                    return data.hero.addItemToBackpack(gameEvent.data.heroId, item.key)
                        .then(function(hero){
                            events.push(utils.createGameEvent(defaultChannel, 'itemPickedUp', gameEvent.data));

                            return data.hero.updateHeroStatsWith(gameEvent.data.heroId, item.modifiers)
                                .then(function(hero){
                                    var newStats = _.pick(hero.toObject(), ['attack', 'defense', 'health', 'currentHealth']);
                                    newStats.id = hero.id;
                                    events.push(utils.createGameEvent('/hero', 'heroStatsChanged', newStats));
                                });
                        })
                        .then(function(){
                            var heroItems = hero.inventoryItems;
                            heroItems.push(item.key);
                            return data.item.findItemsByKeys(heroItems)
                                .then(function(items){
                                    events.push(utils.createGameEvent('/hero', 'inventoryUpdated', {
                                        items: items,
                                        heroId: hero.id
                                    }));
                                });
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
    onItemPickedUp: onItemPickedUp,
};