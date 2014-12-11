var utils = require('./utils'),
    defaultChannel = '/items',
    data = require('../../data'),
    _ = require('underscore');

function reverseItemModifiers(modifiers) {
    var keys = ['attack', 'defense', 'health'];
    var reversedModifiers = {};

    _.each(keys, function(key){
        reversedModifiers[key] = -modifiers[key];
    });

    return reversedModifiers;
}


var onItemDrop = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: heroId, itemKey
        
    console.log('Handle item dropped event', gameEvent);

    var events = [];

    data.item.getItemByKey(gameEvent.data.itemKey)
        .then(function(item){
            return data.hero.findById(gameEvent.data.heroId)
                .then(function(hero){

                    return data.hero.dropItem(gameEvent.data.heroId, item.key)
                        .then(function(hero){
                            events.push(utils.createGameEvent(defaultChannel, 'itemDropped', gameEvent.data));

                            console.log(item.modifiers);
                            var modifiers = reverseItemModifiers(item.modifiers);
                            console.log(modifiers);

                            return data.hero.updateHeroStatsWith(gameEvent.data.heroId, modifiers)
                                .then(function(hero){
                                    var newStats = _.pick(hero.toObject(), ['attack', 'defense', 'health', 'currentHealth']);
                                    newStats.id = hero.id;
                                    events.push(utils.createGameEvent('/hero', 'heroStatsChanged', newStats));
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

var onItemPickedUp = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: heroId, itemKey
    
    var events = [];
    
    data.item.getItemByKey(gameEvent.data.itemKey)
        .then(function(item){
            return data.hero.findById(gameEvent.data.heroId)
                .then(function(hero){
                    if (hero.inventoryItems.indexOf(item.key) !== -1) {
                        throw 'You already have this item';
                    }

                    return data.item.findItemsByKeys(hero.inventoryItems)
                        .then(function(items){
                            var itemTypes = _.pluck(items, 'type');
                            if (itemTypes.indexOf(item.type) !== -1) {
                                throw 'You cannot carry more than one item if this type.';
                            }

                            return data.hero.addItemToBackpack(gameEvent.data.heroId, item.key);
                        })
                        .then(function(){
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
    onItemDrop: onItemDrop
};