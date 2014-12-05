(function() {

    Nv.Map = function(mapConfig) {
        var mapLayer = new Kinetic.Layer();

        this.tileSize = mapConfig.tileSize;
        this.width = mapConfig.width;
        this.height = mapConfig.height;
        this.baseImage = mapConfig.baseImage;
        this.key = mapConfig.key;

        this.layers = {};

        var stepsX = this.width / this.tileSize,
            stepsY = this.height / this.tileSize;

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
    };

    Nv.Map.prototype = {
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