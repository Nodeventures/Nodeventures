(function() {

    MapObject = function(map, width, height, position) {
        this.skipEvents = false;

        this.width = width;
        this.height = height;
        this.map = map;

        var groupConfig = {
            x: position.x,
            y: position.y,
        };

        Kinetic.Group.call(this, groupConfig);
    };

    MapObject.prototype = {

        emitEvent: function(channel, eventKey, eventData) {
            if (!this.skipEvents) {
                Nv.sessionInstance().emitEvent(channel, eventKey, eventData);
            }
        },

    };

    Kinetic.Util.extend(MapObject, Kinetic.Group);

    Nv.MapObject = MapObject;
})();