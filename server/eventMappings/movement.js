var MovementHandler = require('./handlers/MovementHandler');

module.exports = function(eventEngine) {

    // mappings between event key and handler method
    var mappings = {
        'moveHero': MovementHandler.onMoveHero
    };

    // add all mappings to a specific channel
    eventEngine.forChannel('/movement').addMappings(mappings);

};