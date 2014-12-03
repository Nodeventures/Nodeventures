(function() {

    Nv.Hero = function(config) {
        this.width = 32;
        this.height = 48;

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
        animate: function() {
            this.sprite.start();
        }
    };

    Kinetic.Util.extend(Nv.Hero, Kinetic.Group);
})();