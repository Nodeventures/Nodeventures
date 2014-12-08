module.exports = function(eventEngine) {

    // mappings between event key and handler method
    var mappings = {
    };

    // add all mappings to a specific channel
    eventEngine.forChannel('/hero').addMappings(mappings);

};