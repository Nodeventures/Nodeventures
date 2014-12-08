(function() {

    Nv.Obstacle = function(map, config) {
        var stepsX = config.tilesConfig.horizontalTiles,
            stepsY = config.tilesConfig.verticalTiles,
            mapLayer = config.layer,
            repeatX = config.tilesConfig.repeatX || 1,
            tileSize = map.config.tileSize,
            width = stepsX * tileSize * repeatX,
            height = stepsY * tileSize;

        Nv.MapObject.call(this, map, width, height, config.position, config);

        for (var rx = 0; rx < repeatX; rx++) {

            for (var j = 0; j < stepsX; j++) {

                for (var i = 0; i < stepsY; i++) {

                    var tile = new Kinetic.Line({
                        points: [0, 0, 0, tileSize, tileSize, tileSize, tileSize, 0],
                        fillPatternImage: map.baseImage,
                        strokeWidth: 0,
                        fillPatternOffset: [0, 0],
                        closed: true,
                    });

                    tile.fillPatternOffsetX((j + config.tilesConfig.imageX) * tileSize);
                    tile.fillPatternOffsetY((i + config.tilesConfig.imageY) * tileSize);

                    tile.setX((j + rx - 1) * tileSize);
                    tile.setY(i * tileSize);

                    this.add(tile);
                }
            }
        }

        map.enableCollisionsFor(this);

        mapLayer.add(this);
    };

    Nv.Obstacle.prototype = {

    };

    Kinetic.Util.extend(Nv.Obstacle, Nv.MapObject);

})();