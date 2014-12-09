(function() {

    Nv.Hero = function(map, config) {
        Nv.MapObject.call(this, map, config.width || 64, config.height || 64, config.position, config);

        this.name = config.name;
        this.id = config.id;
        this.inBattle = false;
        this.isDead = false;
        this.facingDirection = 'down';

        var hero = this;
        var heroAnimations = {
            // [ x, y ] in sprite sheet
            walk_up: [[0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8]],
            walk_down: [[0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10]],
            walk_left: [[0, 9], [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9]],
            walk_right: [[0, 11], [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11]],
            idle_up: [[0, 8], [0, 8]],
            idle_down: [[0, 10], [0, 10]],
            idle_left: [[0, 9], [0, 9]],
            idle_right: [[0, 11], [0, 11]],
            attack_up: [[0, 12], [1, 12], [2, 12], [3, 12], [4, 12]],
            attack_left: [[0, 13], [1, 13], [2, 13], [3, 13], [4, 13]],
            attack_down: [[0, 14], [1, 14], [2, 14], [3, 14], [4, 14]],
            attack_right: [[0, 15], [1, 15], [2, 15], [3, 15], [4, 15]],
            die: [[0, 22], [1, 22], [2, 22], [3, 22], [4, 22]],
        };

        var animations = [];
        $.each(heroAnimations, function(animationName, frames){
            animations[animationName] = [];

            $.each(frames, function(frameIndex, frameValues){
                // x, y, width, height
                animations[animationName].push(frameValues[0] * hero.width);
                animations[animationName].push(frameValues[1] * hero.height);
                animations[animationName].push(hero.width);
                animations[animationName].push(hero.height);
            });
        });

        // get keys so that we can figure out which animations are affected by direction
        this.animationNames = _.keys(animations);
        this.frameRates = {
            'walk': 17,
            'idle': 1,
            'attack': 8,
            'die': 8
        };

        var spriteConfig = {
            x: 0,
            y: 0,
            image: config.image,
            animation: 'idle_' + this.facingDirection,
            animations: animations,
            frameRate: 17,
            frameIndex: 0
        };

        var textConfig = {
            x: 0,
            y: 0,
            text: this.name,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black'
        };

        this.sprite = new Kinetic.Sprite(spriteConfig);

        var text = new Kinetic.Text(textConfig);
        text.setX(text.getX() - text.getTextWidth() / 2 + this.width / 2);
        text.setY(text.getY() - text.getTextHeight() / 2);
        this.textLabel = text;

        this.add(this.sprite);
        this.add(this.textLabel);

        this.on('mouseover', function(){
            if (hero.id !== Nv.sessionInstance().hero.id){
                hero.showTooltip('Attack');
            }
        });

        this.on('mouseout', function(){
            if (!hero.isDead) {
                hero.hideTooltip();
            }
        });
    };

    Nv.Hero.prototype = {

        leave: function() {
            this.destroyTooltip();
            this.sprite.destroy();
            this.textLabel.destroy();
            if (this.inBattle) {
                var battle = this.inBattle;
                battle.heroFled(this);

                // send flee event 
                Nv.sessionInstance().emitEvent('/battle', 'heroFled', {
                    fleeingHero: this.id,
                });
            }
        },

        animate: function(animationName) {
            if (!animationName) {
                this.sprite.start();
            }
            else {
                // find matching framerate or set default
                var frameRate = _.reduce(this.frameRates, function(memo, rate, key){
                    if (animationName.indexOf(key) === 0) {
                        memo = rate;
                    }
                    return memo;
                }, null) || 17;
                this.sprite.frameRate(frameRate);

                if (_.contains(this.animationNames, animationName)) {
                    this.sprite.animation(animationName);
                }
                else {
                    this.sprite.animation(animationName + "_" + this.facingDirection);
                }
            }
        },

        mapObjectClicked: function() {
            if (this.isDead) {
                return Nv.Session.showGameMessage('That guy is dead. Leave him be!');
            }

            if (this.inBattle) {
                // player clicked on his own hero
                if (this.id === Nv.sessionInstance().hero.id) {
                    Nv.Session.showGameMessage('Oooohh, that tickles!');
                }
                // player hero attacks
                else {
                    this.inBattle.triggerAttackBy(Nv.sessionInstance().hero);
                }
                
            } else {
                if (this.id === Nv.sessionInstance().hero.id) {
                    return this.saySomething(['Hello!'], 1);
                }
                else {
                    // start battle with player hero
                    var battle = new Nv.Battle(this, Nv.sessionInstance().hero);
                    battle.start();
                }
            }
        },

        animateAttack: function() {
            this.animate('attack');
            var taunts = ['Take that!', 'Raaaawwrr!', 'Pew pew!', 'Have at thee!'];
            this.showTooltip(_.sample(taunts, 1));

            var attacker = this;
            setTimeout(function(){
                attacker.animate('idle');
                attacker.hideTooltip();
            }, 1000);
        },

        saySomething: function(sayings, percentOfTime) {
            var number = _.random(0, 10);
            if (number / 10 <= percentOfTime) {
                this.showTooltip(_.sample(sayings, 1));

                // hide bubble after 2 sec
                var hero = this;
                setTimeout(function(){
                    hero.hideTooltip();
                }, 1000);
            }
        },

        animateDeath: function() {
            this.animate('walk');
            var taunts = ['Goodbye cruel world...', 'RIP', 'Mommieee!', ':X'];
            this.showTooltip(_.sample(taunts, 1));
            this.isDead = true;

            var deadGuy = this;
            setTimeout(function(){
                deadGuy.animate('idle');
                deadGuy.hideTooltip();
                deadGuy.isDead = false; // respawn
            }, 5000);
        },

        calculateFacingDirection: function(targetX, targetY) {
            var diffX = this.getX() - targetX,
                diffY = this.getY() - targetY,
                axis = Math.abs(diffX) <= Math.abs(diffY) ? 'y' : 'x',
                facingDirection = null;

            if (axis === 'y') {
                facingDirection = diffY < 0 ? 'down' : 'up';
            }
            else {
                facingDirection = diffX < 0 ? 'right' : 'left';
            }

            this.facingDirection = facingDirection;
        },

        moveToPosition: function(x, y, callback) {
            if (this.inBattle) {
                return;
            }

            if (!this.map.canMoveToPosition(x, y)) {
                return;
            }

            if (this.currentAnimation) {
                this.currentAnimation.pause();
            }

            this.calculateFacingDirection(x, y);

            this.saySomething(['On my way', 'As you command', 'I\'m so tired..', 'Look! A nickel!'], 0.4);

            // send event
            this.emitEvent('/movement', 'moveHero', {
                'hero_id': this.id,
                'map_id': this.map.id,
                'start': {x: this.x, y: this.y},
                'end': {x: x, y: y},
            });

            var hero = this;

            var durationToRunThroughMap = 3; // sec
            var distanceMoved = Math.sqrt(Math.pow(x - this.getX(), 2) + Math.pow(y - this.getY(), 2));
            var distancePart = distanceMoved / this.map.width;

            var duration = distancePart * durationToRunThroughMap;

            this.currentAnimation = new Kinetic.Tween({
                node: this,
                duration: duration,
                x: x,
                y: y,
                easing: Kinetic.Easings.Linear,

                onFinish: function() {
                    hero.x = x;
                    hero.y = y;
                    hero.animate('idle');
                    if (callback) {
                        callback();
                    }
                }
            });

            this.animate('walk');
            this.currentAnimation.play();
        }
    };

    Kinetic.Util.extend(Nv.Hero, Nv.MapObject);

    function setupEvents() {

    }
})();