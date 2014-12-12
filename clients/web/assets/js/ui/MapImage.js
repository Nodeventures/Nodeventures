(function() {

    Nv.MapImage = function(map, config) {
        Nv.MapObject.call(this, map, config.width, config.height, config.position, config);

        this.name = config.name;
        this.key = config.key;

        var image = new Kinetic.Image({
            x: 0,
            y: 0,
            image: Nv.sessionInstance().images[config.key],
            width: config.width,
            height: config.height
        });

        this.image = image;
        this.config = config;

        this.onClickHandler = config.onClickHandler || function() {};

        this.add(this.image);
    };

    Nv.MapImage.prototype = {
        mapObjectClicked: function() {
            return this.onClickHandler.call(this);
        },

    };

    Kinetic.Util.extend(Nv.MapImage, Nv.MapObject);

})();