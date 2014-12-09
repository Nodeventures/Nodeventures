(function() {

    Nv.Hero = function(map, config) {
        Nv.MapObject.call(this, map, 32, 48, config.position, config);

        this.name = config.name;
        this.id = config.id;
        this.inBattle = false;
        this.isDead = false;

        var hero = this;

        var animations = [];
        $.each(config.animations || [], function(animationName, frames){
            animations[animationName] = [];

            $.each(frames, function(frameIndex, frameValues){
                // x, y, width, height
                animations[animationName].push(frameValues[0] * hero.width);
                animations[animationName].push(frameValues[1] * hero.height);
                animations[animationName].push(hero.width);
                animations[animationName].push(hero.height);
            });
        });

        var spriteConfig = {
            x: 0,
            y: 0,
            image: config.image,
            animation: 'idle',
            animations: animations,
            frameRate: 7,
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
            this.sprite.destroy();
            this.textLabel.destroy();
            if (this.inBattle) {
                var battle = this.inBattle;
                battle.heroFled(this);
            }
        },

        animate: function(animationName) {
            if (!animationName) {
                this.sprite.start();
            }
            else {
                this.sprite.animation(animationName);
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
                // start battle with player hero
                var battle = new Nv.Battle(this, Nv.sessionInstance().hero);
                battle.start();
            }
        },

        animateAttack: function() {
            // TODO: replace with attack
            this.animate('walk');
            var taunts = ['Take that!', 'Raaaawwrr!', 'Pew pew!', 'Have at thee!'];
            this.showTooltip(_.sample(taunts, 1));

            var attacker = this;
            setTimeout(function(){
                attacker.animate('idle');
                attacker.hideTooltip();
            }, 1000);
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