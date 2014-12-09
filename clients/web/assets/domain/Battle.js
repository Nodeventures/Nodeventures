(function() {

    function setupEvents() {
        // var heroSocket = this.session.connectToChannel('/hero'),
        //     hud = this;

        // heroSocket.on('heroStatsChanged', function(data){
        //     if (data.id === hud.heroId) {
        //         $.each(data, function(key, value){
        //             hud.data[key] = value;
        //         });
        //         hud.refreshUI();
        //     }
        // });

        // heroSocket.on('inventoryUpdated', function(data){
        //     if (data.heroId === hud.heroId) {
        //         hud.data.inventory = data.items;
        //         hud.refreshUI();
        //     }
        // });
    }

    Nv.Battle = function(otherHero, protagonist) {
        this.protagonist = protagonist;
        this.otherHero = otherHero;
        this.attacker = protagonist.id;

        this.heroMap = {};
        this.heroMap[this.protagonist.id] = this.protagonist;
        this.heroMap[this.otherHero.id] = this.otherHero;

        this.battlePair = {};
        this.battlePair[this.protagonist.id] = this.otherHero.id;
        this.battlePair[this.otherHero.id] = this.protagonist.id;

        protagonist.moveToPosition(otherHero.getX() - otherHero.width - 10, otherHero.getY());

        this.otherHero.inBattle = this;
        this.protagonist.inBattle = this;

        // add battle image
        this.image = new Nv.MapImage(Nv.sessionInstance().map, {
            'key': 'battle',
            'width': 34,
            'height': 34,
            'position': {
                x: otherHero.getX()-22, // 34 / 2 + 10 / 2
                y: otherHero.getY()-50
            },
            layer: 'heroLayer',
            tooltipText: 'Flee',
            onClickHandler: function() {
                var fleeingHero = Nv.sessionInstance().hero;
                Nv.sessionInstance().emitEvent('/battle', 'heroFled', {
                    fleeingHero: fleeingHero.id,
                });
            }
        });
        Nv.sessionInstance().map.addToLayer(this.image, 'heroLayer');

        protagonist.showTooltip('Charge!');
        setTimeout(function(){
            protagonist.hideTooltip();
        }, 1000);

        Nv.Session.showGameMessage('Battle started between ' + otherHero.name + ' and ' + protagonist.name);

        // events
        setupEvents.call(this);
    };

    Nv.Battle.prototype = {
        start: function() {
            Nv.sessionInstance().emitEvent('/battle', 'battleStarted', {
                heroId: this.protagonist.id,
                otherHeroId: this.otherHero.id,
                firstAttacker: this.protagonist.id
            });
        },

        heroFled: function(hero) {
            this.protagonist.inBattle = false;
            this.otherHero.inBattle = false;
            this.image.hideFromUI();
            Nv.Session.showGameMessage('Player ' + hero.name + ' fled the battlefield');
        },

        hasCurrentTurn: function(heroId) {
            return this.attacker === heroId;
        },

        firstAttackBy: function (heroId) {
            this.attacker = heroId;
        },

        triggerAttackBy: function(hero) {
            if (this.attacker !== hero.id) {
                Nv.Session.showGameMessage('You must wait your turn to attack');
            }
            else {
                // emit attack event
                Nv.sessionInstance().emitEvent('/battle', 'heroAttacked', {
                    attacker: this.attacker,
                    defender: this.battlePair[this.attacker]
                });
            }
        },

        performAttackBy: function(attackerHero) {
            var defenderId = this.battlePair[attackerHero.id],
                defenderHero = this.heroMap[defenderId];

            attackerHero.animateAttack();

            // go to next turn
            this.attacker = this.battlePair[this.attacker];
        }
    };

})();