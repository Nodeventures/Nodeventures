(function() {

    function setupEvents() {
        var heroSocket = this.session.connectToChannel('/hero'),
            hud = this;

        heroSocket.on('heroStatsChanged', function(data){
            if (data.id === hud.heroId) {
                $.each(data, function(key, value){
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

        var battleSocket = this.session.connectToChannel('/battle');

        battleSocket.on('heroAttacked', function(data){
            hud.showGameMessage(data.attackerName + ' attacked ' + data.defenderName + ' for ' + data.attackDamage);
        });
    }

    function setupUIEvents(hud) {
        $('#hero-inventory .item').on('click', function(){
            var $item = $(this),
                key = $item.attr('data-item-key'),
                item = _.find(hud.data.inventory, function(item){
                    return item.key === key;
                }),
                itemName = item.name;

            if (confirm('Do you want to drop "' + itemName + '"?')) {
                hud.emitEvent('/items', 'dropItem', {
                    'heroId': hud.data.id,
                    'itemKey': key
                });

                hud.data.inventory = _.filter(hud.data.inventory, function(item){
                    return item.key !== key;
                });

                hud.refreshUI();

                Nv.sessionInstance().hero.saySomething(['Hey! I liked that thing..', 'Hurray! I can run again!', 'I must have misplaced something...'], 0.3);
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
        this.data.messages = [];

        this.container.html(html);

        setupUIEvents(this);

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
            setupUIEvents(this);
        },

        showGameMessage: function(message) {
            message = moment().format('hh:mm:ss') + ' - ' + message;
            this.data.messages.unshift(message);
            $("#hud-messages").prepend('<div>'+message+'</div>');
        }

    };

})();