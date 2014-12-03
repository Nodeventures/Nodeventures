var utils = require('./utils'),
    defaultChannel = '/movement';


var onMoveHero = utils.wrapWithPromise(function(gameEvent, deferred){
    // eventData: hero_id, start position, end position
        
    // set new hero position in database
    console.log('Handle movement event', gameEvent);
    
    // send event to clients
    deferred.resolve(utils.createGameEvent(defaultChannel, 'heroMoved', gameEvent.data));
});

module.exports = {
    onMoveHero: onMoveHero
};