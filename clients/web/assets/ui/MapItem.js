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
                // pickup item
                item.emitEvent('/items', 'itemPickedUp', {
                    'heroId': hero.id,
                    'itemKey': item.key,
                });
            });
            
        },

    };

    Kinetic.Util.extend(Nv.MapItem, Nv.MapObject);

    function setupEvents() {
        var itemsSocket = this.session.connectToChannel('/items'),
            item = this;

        itemsSocket.on('itemPickedUp', function(data){
            if (data.itemKey === item.key) {
                item.hideFromUI();
            }
        });
    }
})();