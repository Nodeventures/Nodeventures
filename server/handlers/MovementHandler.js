var utils = require('./utils'),
    defaultChannel = '/movement';

var onMoveHero = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: hero_id, start position, end position
        
    // TODO set new hero position in database
    console.log('Handle movement event', gameEvent);
    
    // send event to clients
    deferred.resolve(utils.createGameEvent(defaultChannel, 'heroMoved', gameEvent.data));
});

var onMapChanged = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: hero_id, map_key
        
    // TODO change map_key in hero.position
    // set hero.position x and y to map startingPoint x, y
    console.log('Handle map change event', gameEvent);

    // TODO: load new map data for hero and send back
    
    // send event to clients
    deferred.resolve(utils.createGameEvent(defaultChannel, 'heroChangedMap', gameEvent.data));
});

module.exports = {
    onMoveHero: onMoveHero,
    onMapChanged: onMapChanged
};