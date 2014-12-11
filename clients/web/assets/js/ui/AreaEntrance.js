(function() {

    Nv.AreaEntrance = function(map, config) {
        config.key = config.image;
        config.width = config.dimentions.width;
        config.height = config.dimentions.height;
        config.layer = 'areasLayer';

        var areaEntrance = this;
        config.onClickHandler = function(){
            var hero = Nv.sessionInstance().hero;

            if (!hero.interactionsDisabled()) {
                areaEntrance.emitEvent('/system', 'areaChanged', {
                    'heroId': Nv.sessionInstance().hero.id,
                    'mapKey': areaEntrance.leadsToMap
                });
            }

            // BUG: somehow the callback is undefined and won't call after hero reaches target
            // Nv.sessionInstance().hero.moveToPosition(areaEntrance.getX(), areaEntrance.getY(), function(){
            //     areaEntrance.emitEvent('/system', 'areaChanged', {
            //         'heroId': Nv.sessionInstance().hero.id,
            //         'mapKey': areaEntrance.leadsToMap
            //     });
            // });
        };

        config.tooltipText = 'Enter area';

        Nv.MapImage.call(this, map, config);

        this.leadsToMap = config.mapKey;
    };

    Kinetic.Util.extend(Nv.AreaEntrance, Nv.MapImage);

})();