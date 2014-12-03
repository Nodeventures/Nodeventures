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

        var spriteConfig = {
            x: config.position.x,
            y: config.position.y,
            image: config.image,
            animation: 'idle',
            animations: animations,
            frameRate: 7,
            frameIndex: 0
        };

        Kinetic.Sprite.call(this, spriteConfig);
    };

    Nv.Hero.prototype = {
        testFunc: function() {}
    };

    Kinetic.Util.extend(Nv.Hero, Kinetic.Sprite);

})();