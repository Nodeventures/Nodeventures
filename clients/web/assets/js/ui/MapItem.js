(function() {

    Nv.MapItem = function(map, config) {
        config.tooltipText = config.name;

        Nv.MapObject.call(this, map, 34, 34, config.position, config);

        this.name = config.name;
        this.key = config.key;

        var image = new Kinetic.Image({
            x: 0,
            y: 0,
            image: Nv.sessionInstance().images[config.key],
            width: 34,
            height: 34
        });

        this.image = image;
        this.config = config;

        this.add(this.image);

        setupEvents.call(this);

        map.enableCollisionsFor(this);
    };

    Nv.MapItem.prototype = {
        mapObjectClicked: function() {
            var hero = Nv.sessionInstance().hero,
                item = this,
                x = this.getX()-1,
                y = this.getY()-1;

            // move hero to item abd pickup item
            hero.moveToPosition(x, y, function(){
                
                hero.saySomething(['Oooh, shiny!', 'What\'s this s@#t?!', 'Damn! Thought that was a squirrel..', 'It must be my birthday!'], 0.7);
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
        var itemsSocket = Nv.sessionInstance().connectToChannel('/items'),
            item = this;

        itemsSocket.on('itemPickedUp', function(data){
            if (data.itemKey === item.key) {
                item.hideFromUI();
            }
        });
    }
})();