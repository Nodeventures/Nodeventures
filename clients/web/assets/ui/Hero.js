(function() {

    Nv.Hero = function(config) {
        this.width = 32;
        this.height = 48;
        this.channels = config.channels;
        this.id = config.id;

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

        var groupConfig = {
            x: config.position.x,
            y: config.position.y,
        };

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
            text: config.name,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black'
        };

        this.sprite = new Kinetic.Sprite(spriteConfig);

        var text = new Kinetic.Text(textConfig);
        text.setX(text.getX() - text.getTextWidth() / 2 + this.width / 2);
        text.setY(text.getY() - text.getTextHeight() / 2);
        this.text = text;

        Kinetic.Group.call(this, groupConfig);

        this.add(this.sprite);
        this.add(this.text);
    };

    Nv.Hero.prototype = {
        emitEvent: function(channel, eventKey, eventData) {
            this.channels[channel].emit(eventKey, {
                channel: channel,
                key: eventKey,
                data: eventData
            });
        },

        animate: function(animationName) {
            if (!animationName) {
                this.sprite.start();
            }
            else {
                this.sprite.animation(animationName);
            }
        },

        moveTo: function(x, y, map) {
            if (this.currentAnimation) {
                this.currentAnimation.pause();
            }

            // send event
            this.emitEvent('/movement', 'moveHero', {
                'hero_id': this.id,
                'map_id': map.id,
                'start': {x: this.x, y: this.y},
                'end': {x: x, y: y},
            });

            var hero = this;

            var durationToRunThroughMap = 3; // sec
            var distanceMoved = Math.sqrt(Math.pow(x - this.getX(), 2) + Math.pow(y - this.getY(), 2));
            var distancePart = distanceMoved / map.width;

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
                }
            });

            this.animate('walk');
            this.currentAnimation.play();
        }
    };

    Kinetic.Util.extend(Nv.Hero, Kinetic.Group);
})();