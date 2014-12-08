(function() {

    Nv.MapItem = function(map, config) {
        Nv.MapObject.call(this, map, 34, 34, config.position);

        this.name = config.name;
        this.key = config.key;

        var image = new Kinetic.Image({
            x: 0,
            y: 0,
            image: config.session.images[config.key],
            width: 34,
            height: 34
        });

        this.image = image;

        this.add(this.image);

        map.enableCollisionsFor(this);
    };

    Nv.MapItem.prototype = {
        
    };

    Kinetic.Util.extend(Nv.MapItem, Nv.MapObject);
})();