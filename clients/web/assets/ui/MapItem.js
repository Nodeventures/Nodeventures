(function() {

    Nv.MapItem = function(map, config) {
        config.tooltipText = config.name;

        Nv.MapObject.call(this, map, 34, 34, config.position, config);

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
        this.config = config;

        this.add(this.image);

        map.enableCollisionsFor(this);
    };

    Nv.MapItem.prototype = {
        onClick: function() {
            var hero = Nv.sessionInstance().hero,
                item = this;
                
            // move hero to item abd pickup item
            hero.moveToPosition(this.getX()-1, this.getY()-1, function(){
                item.hideFromUI();
            });

            // pickup item
            this.emitEvent('/items', 'itemPickedUp', {
                'heroId': hero.id,
                'itemKey': this.key,
            });
        }
    };

    Kinetic.Util.extend(Nv.MapItem, Nv.MapObject);
})();