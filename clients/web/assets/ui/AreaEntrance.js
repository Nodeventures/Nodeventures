(function() {

    Nv.AreaEntrance = function(map, config) {
        Nv.MapImage.call(this, map, config);
        
        this.leadsToMap = config.mapKey;

        config.key = config.image;
        config.width = config.dimentions.width;
        config.height = config.dimentions.height;
        config.layer = 'obstaclesLayer';

        var areaEntrance = this;
        config.onClickHandler = function(){
            alert('going to ' + areaEntrance.leadsToMap);
        };

        config.tooltipText = 'Enter area';

        // console.log(config);

        // Nv.MapImage.call(this, map, config);
    };

    Kinetic.Util.extend(Nv.AreaEntrance, Nv.MapImage);

})();