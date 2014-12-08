var ItemsHandler = require('../handlers/ItemsHandler');

module.exports = function(eventEngine) {

    // mappings between event key and handler method
    var mappings = {
        'itemPickedUp': ItemsHandler.onItemPickedUp
    };

    // add all mappings to a specific channel
    eventEngine.forChannel('/items').addMappings(mappings);

};