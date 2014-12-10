(function() {

    function setupEvents() {
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

        protagonist.moveToPosition(otherHero.getX() - otherHero.width * 2 / 3, otherHero.getY(), function(){
            protagonist.calculateFacingDirection(otherHero.getX(), otherHero.getY());
            protagonist.animate('idle');

            otherHero.calculateFacingDirection(protagonist.getX(), protagonist.getY());
            otherHero.animate('idle');
        });

        this.otherHero.inBattle = this;
        this.protagonist.inBattle = this;

        this.attackEventSent = false;

        // add battle image
        this.image = new Nv.MapImage(Nv.sessionInstance().map, {
            'key': 'battle',
            'width': 34,
            'height': 34,
            'position': {
                x: otherHero.getX() - 17 * 1 / 3, // 34 / 2 +
                y: otherHero.getY() - 42
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
                firstAttacker: this.protagonist.id,
                mapKey: Nv.sessionInstance().map.key
            });
        },

        cancelBattle: function() {
            this.protagonist.inBattle = false;
            this.otherHero.inBattle = false;
            this.image.hideFromUI();
        },

        heroFled: function(hero) {
            this.cancelBattle();
            Nv.Session.showGameMessage('Player ' + hero.name + ' fled the battlefield');
        },

        resolveBattleWithDeath: function(deadGuy) {
            this.cancelBattle();
            deadGuy.animateDeath();
            Nv.Session.showGameMessage('Player ' + deadGuy.name + ' was killed in action.');
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
                if (!this.attackEventSent) {
                    // emit attack event
                    Nv.sessionInstance().emitEvent('/battle', 'heroAttacked', {
                        attacker: this.attacker,
                        defender: this.battlePair[this.attacker]
                    });
                    // make sure he can't attack until his next turn
                    this.attackEventSent = true;
                }
            }
        },

        performAttackBy: function(attackerHero) {
            var defenderId = this.battlePair[attackerHero.id],
                defenderHero = this.heroMap[defenderId];

            attackerHero.animateAttack();

            // go to next turn
            this.attacker = this.battlePair[this.attacker];
            // allow attacking
            this.attackEventSent = false;
        }
    };

})();