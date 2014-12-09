(function() {

    function setupEvents() {
        var movementSocket = this.session.connectToChannel('/movement'),
            map = this;

        movementSocket.on('heroMoved', function(data){
            if (typeof map.heroes[data.hero_id] !== 'undefined') {
                var hero = map.heroes[data.hero_id];
                if (hero) {
                    hero.moveToPosition(data.end.x, data.end.y);
                }
            }
        });
    }

    function drawMap(mapConfig) {
        var stepsX = this.width / this.tileSize,
            stepsY = this.height / this.tileSize,
            mapLayer = new Kinetic.Layer();

        for (var j = 0; j < stepsX; j++) {

            for (var i = 0; i < stepsY; i++) {

                var tile = new Kinetic.Line({
                    points: [0, 0, 0, this.tileSize, this.tileSize, this.tileSize, this.tileSize, 0],
                    fillPatternImage: this.baseImage,
                    strokeWidth: 0,
                    fillPatternOffset: [0, 0],
                    closed: true,
                });

                tile.fillPatternOffsetX(this.tileSize * Math.floor(Math.random() * mapConfig.tilesConfig.stepsHorizontalAllowed + mapConfig.tilesConfig.imageX));
                tile.fillPatternOffsetY(this.tileSize * Math.floor(Math.random() * mapConfig.tilesConfig.stepsVerticalAllowed + mapConfig.tilesConfig.imageY));

                tile.setX(j * this.tileSize);
                tile.setY(i * this.tileSize);

                mapLayer.add(tile);
            }
        }

        this.layers['mapLayer'] = mapLayer;

        this.layers['areasLayer'] = new Kinetic.Layer();

        this.layers['itemsLayer'] = new Kinetic.Layer();

        this.layers['heroLayer'] = new Kinetic.Layer();

        this.layers['obstaclesLayer'] = new Kinetic.Layer();
    }

    function addObstaclesLayer(obstacles) {
        var map = this;
        $.each(obstacles, function(index, obstacle){
            obstacle.session = map.session;
            obstacle.map = map;
            obstacle.layer = map.layers['obstaclesLayer'];
            var mapObstacle = new Nv.Obstacle(map, obstacle);
        });
    }

    function addItemsLayer(mapItems) {
        var map = this;
        $.each(mapItems, function(index, item){
            item.session = map.session;
            item.map = map;
            var mapItem = new Nv.MapItem(map, item);
            mapItem.layer = map.layers['itemsLayer'];
            map.layers['itemsLayer'].add(mapItem);
        });
    }

    Nv.Map = function(mapConfig) {
        this.tileSize = mapConfig.tileSize;
        this.width = mapConfig.width;
        this.height = mapConfig.height;
        this.baseImage = mapConfig.baseImage;
        this.key = mapConfig.key;
        this.session = mapConfig.session;
        this.config = mapConfig;

        this.layers = {};
        this.heroes = {};
        this.collisions = [];

        drawMap.call(this, mapConfig);

        addItemsLayer.call(this, mapConfig.itemsOnMap);
        addObstaclesLayer.call(this, mapConfig.obstacles);

        // events
        setupEvents.call(this);
    };

    Nv.Map.prototype = {

        heroEnter: function(hero, protagonist) {
            if (!protagonist) {
                this.heroes[hero.id] = hero;
            }
            this.layers['heroLayer'].add(hero);
            hero.animate();
        },

        heroLeave: function(hero_id) {
            if (typeof this.heroes[hero_id] !== 'undefined') {
                var hero = this.heroes[hero_id];
                delete this.heroes[hero_id];
                hero.leave();
                Nv.Session.showGameMessage('Hero ' + hero.name + ' left area.');
            }
        },

        getLayers: function() {
            return this.layers;
        },

        addToLayer: function(item, layer) {
            this.layers[layer].add(item);
        },

        addLayersToStage: function(stage) {
            $.each(this.layers, function(layerKey, layer){
                stage.add(layer);
            });
        },

        enableCollisionsFor: function(mapObject) {
            this.collisions.push(mapObject.getCollisionDimentions());
        },

        getHero: function(heroId) {
            if (Nv.sessionInstance().hero.id === heroId) {
                return Nv.sessionInstance().hero;
            }
            return this.heroes[heroId];
        },

        canMoveToPosition: function(x, y) {
            var collisionsLength = this.collisions.length;

            for (var i = 0; i < collisionsLength; i++) {
                var collision = this.collisions[i];
                var xCollides = x >= collision.x && x <= collision.x + collision.width;
                var yCollides = y >= collision.y && y <= collision.y + collision.height;

                if (xCollides && yCollides) {
                    return false;
                }
            };

            return true;
        }
    };

})();