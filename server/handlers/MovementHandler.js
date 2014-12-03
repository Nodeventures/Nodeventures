var util = require('./util'),
    defaultChannel = '/movement';


var onMoveHero = util.wrapWithPromise(function(gameEvent, deferred){
    // eventData: hero_id, start position, end position
        
    // set new hero position in database
    
    // send event to clients
    deferred.resolve(util.createGameEvent(defaultChannel, 'heroMoved', gameEvent.data));
});

module.exports = {
    onMoveHero: onMoveHero
};