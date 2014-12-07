(function() {

    function setupEvents() {
        var movementSocket = this.session.connectToChannel('/movement'),
            map = this;

        // movementSocket.on('heroMoved', function(data){
        //     if (typeof map.heroes[data.hero_id] !== 'undefined') {
        //         var hero = map.heroes[data.hero_id];
        //         if (hero) {
        //             hero.moveToPosition(data.end.x, data.end.y);
        //         }
        //     }
        // });
    }

    function updateHeroStats(newStats) {

    }

    Nv.HUD = function(hudConfig) {
        this.template = Handlebars.compile($("#hud-template").html());
        this.container = $(hudConfig.container);

        this.session = hudConfig.session;

        var html = this.template(hudConfig.hero);

        this.container.html(html);
        
        // events
        setupEvents.call(this);
    };

    Nv.HUD.prototype = {

        emitEvent: function(channel, eventKey, eventData) {
            if (!this.skipEvents) {
                Nv.sessionInstance().emitEvent(channel, eventKey, eventData);
            }
        },

        refreshUI: function(data) {
            this.container.html(this.template(data));
        }

    };

})();