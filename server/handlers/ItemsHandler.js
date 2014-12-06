var utils = require('./utils'),
    defaultChannel = '/items';

var onItemPickedUp = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: hero_id, item_id
        
    console.log('Handle item picked up event', gameEvent);
    // TODO: if hero has item -> reject
    // if hero overburdened -> reject
    // else add item id to hero and modify hero stats
    
    var events = [
        utils.createGameEvent('/hero', 'heroStatsChanged', {
            // new atk/def/health
        }),
        utils.createGameEvent(defaultChannel, 'itemPickedUp', gameEvent.data)
    ];
    
    // send event to clients
    deferred.resolve(events);
});

module.exports = {
    onItemPickedUp: onItemPickedUp,
};