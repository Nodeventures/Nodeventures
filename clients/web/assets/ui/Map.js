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

        this.layers['heroLayer'] = new Kinetic.Layer();
    }

    Nv.Map = function(mapConfig) {
        this.tileSize = mapConfig.tileSize;
        this.width = mapConfig.width;
        this.height = mapConfig.height;
        this.baseImage = mapConfig.baseImage;
        this.key = mapConfig.key;
        this.session = mapConfig.session;

        this.layers = {};

        this.heroes = {};

        drawMap.call(this, mapConfig);

        // //Obects (background)
        // var tS = 32;
        // var collisions = new Array();
        // var objects = new Array();
        // for(var j=0; j<20; j++)
        // {
        //   objects[j] = new Array();
        //   collisions[j] = new Array();
        //   for(var i=0; i<20; i++)
        //   {
        //     if(Math.floor(Math.random()*100)>90) //10%
        //     {
        //       objects[j][i] = new Kinetic.QImage({  //This sprite was 3x4 tiles
        //         x: 32*i,
        //         y: 32*j,
        //         image: images.tileSet,
        //         width: 32,
        //         height: 32,
        //         name: "image",
        //         srcx: tS*(2+2*Math.floor(Math.random()*2)), //x source position
        //         srcy: tS*35, //y source position
        //         srcwidth: 32, //source width
        //         srcheight: 36 //source height
        //       });
        //       collisions[j][i] = true;
        //       //objects[j][i].draggable(true); //drag em? sure...
        //        // add the shape to the layer
        //       objectlayer.add(objects[j][i]);
        //     }
        //     else
        //       collisions[j][i] = false;
        //   } 
        // }//End Obect Layer

        // stage.add(objectlayer); //rockts,trees for collisions
        
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
            }
        },

        getLayers: function() {
            return this.layers;
        },

        addLayersToStage: function(stage) {
            $.each(this.layers, function(layerKey, layer){
                stage.add(layer);
            });
        }
    };

})();