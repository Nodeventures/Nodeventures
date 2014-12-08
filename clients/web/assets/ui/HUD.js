(function() {

    function setupEvents() {
        var heroSocket = this.session.connectToChannel('/hero'),
            hud = this;

        heroSocket.on('heroStatsChanged', function(data){
            if (data.id === hud.heroId) {
                $.each(data, function(key, value){
                    console.log(key, value);
                    hud.data[key] = value;
                });
                hud.refreshUI();
            }
        });

        heroSocket.on('inventoryUpdated', function(data){
            if (data.heroId === hud.heroId) {
                hud.data.inventory = data.items;
                hud.refreshUI();
            }
        });
    }

    Nv.HUD = function(hudConfig) {
        this.template = Handlebars.compile($("#hud-template").html());
        this.container = $(hudConfig.container);
        this.heroId = Nv.sessionInstance().hero.id;

        this.session = hudConfig.session;

        var html = this.template(hudConfig.hero);
        this.data = hudConfig.hero;

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

        refreshUI: function() {
            this.container.html(this.template(this.data));
        },

        showGameError: function(message) {
            console.log('gameError', message);
        }

    };

})();