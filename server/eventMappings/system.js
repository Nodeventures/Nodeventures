var LoginHandler = require('../handlers/LoginHandler');

module.exports = function(eventEngine) {

    // mappings between event key and handler method
    var mappings = {
        'userLogin': LoginHandler.onUserLogin,
        'userLogout': LoginHandler.onUserLogout,
        'areaChanged': LoginHandler.onAreaChanged
    };

    var forwardEvents = ['areaChanged'];

    // add all mappings to a specific channel
    eventEngine.forChannel('/system')
        .addMappings(mappings)
        .forwardEvents(forwardEvents);

};