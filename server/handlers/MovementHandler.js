var utils = require('./utils'),
    defaultChannel = '/movement',
    data = require('../../data');

var onMoveHero = utils.wrapWithPromise(function(gameEvent, deferred) {
    // eventData: hero_id, start position, end position

    data.hero.updateHeroPosition(gameEvent.data.hero_id, gameEvent.data.end)
        .fail(function(err) {
            deferred.reject(err);
        })
        .done(function() {
            deferred.resolve(utils.createGameEvent(defaultChannel, 'heroMoved', gameEvent.data));
        });
});

module.exports = {
    onMoveHero: onMoveHero,
};