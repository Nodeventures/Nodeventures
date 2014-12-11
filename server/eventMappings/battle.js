var BattleHandler = require('../handlers/BattleHandler');

module.exports = function(eventEngine) {

    // mappings between event key and handler method
    var mappings = {
        "heroAttacked": BattleHandler.onHeroAttacked,
        'battleStarted': BattleHandler.onBattleStarted,
        'heroFled': BattleHandler.onHeroFled,
        'heroDied': BattleHandler.onHeroDied
    };

    var forwardedEvents = ['battleStarted', 'heroFled'];

    // add all mappings to a specific channel
    eventEngine.forChannel('/battle')
        .addMappings(mappings)
        .forwardEvents(forwardedEvents);
};