(function() {
    var channels = {},
        lastUsedUsername = null,
        sessionOptions = {},
        currentSession = null;

    function loadImages(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        for (var i in sources) {
            numImages++;
        }
        for (var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                if (++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].src = sources[src];
        }
    }

    function setupEvents(session) {
        var movementSocket = session.connectToChannel('/movement');

        movementSocket.on('heroMoved', function(data){
            if (data.hero_id !== session.hero.id) {
                var hero = session.heroes[data.hero_id];
                if (hero) {
                    hero.moveTo(data.end.x, data.end.y, currentSession.map);
                }
            }
        });
    }

    function createHero(session, heroConfig, protagonist) {
        heroConfig.session = session;

        // setup hero
        var hero = new Nv.Hero(heroConfig);
        session.layers['heroLayer'].add(hero);
        hero.animate();
        hero.skipEvents = !protagonist;

        return hero;
    }

    Nv.Session = function(sessionData) {
        this.hero = null;
        this.user = sessionData.user;
        this.map = null;
        this.heroes = [];
        this.heroesMap = {};
        this.config = sessionData;

        this.images = {};
        this.layers = {};

        this.container = sessionOptions.container;

        var imagesToLoad = sessionData.images;

        var session = this;
        loadImages(imagesToLoad, function(images){
            session.images = images;
            if (sessionOptions.onCreate) {
                sessionOptions.onCreate(session);
            }
            session.start();
        });
    };

    Nv.Session.prototype = {
        connectToChannel: function(channel) {
            return Nv.Session.connectToChannel(channel);
        },

        emitEvent: function(channel, eventKey, eventData) {
            var socket = this.connectToChannel(channel);

            socket.emit(eventKey, {
                channel: channel,
                key: eventKey,
                data: eventData
            });
        },

        start: function() {
            setupEvents(this);

            var stage = new Kinetic.Stage({
                container: this.container,
                width: this.config.map.width,
                height: this.config.map.height
            });

            this.layers['heroLayer'] = new Kinetic.Layer();

            // add main hero
            var heroConfig = this.config.hero;
            heroConfig.image = this.images.heroSprite;
            var isProtagonist = true;
            var hero = createHero(this, heroConfig, isProtagonist);
            this.hero = hero;

            // setup map
            var mapConfig = this.config.map;
            mapConfig.baseImage = this.images.tileSet;
            var areaMap = new Nv.Map(mapConfig);
            areaMap.addLayersToStage(stage);
            this.map = areaMap;

            stage.add(this.layers['heroLayer']);
            stage.draw();

            Nv.Interactions.init(hero, this.container, areaMap);
        },

        loginHero: function(heroConfig) {
            // if hero is on current map
            if (heroConfig.position.map === this.map.key) {
                var imagesToLoad = {heroSprite: heroConfig.heroSprite};
                loadImages(imagesToLoad, function(images){
                    heroConfig.image = images.heroSprite;
                    var isProtagonist = false;
                    var hero = createHero(currentSession, heroConfig, isProtagonist);
                    currentSession.heroes[hero.id] = hero;
                });

                // trigger event for hud
            }
        }
    };

    Nv.Session.initStatic = function(options) {
        sessionOptions = options;
    };

    Nv.Session.connectToChannel = function(channel) {
        if (typeof channels[channel] !== 'undefined') {
            return channels[channel];
        }
        channels[channel] = io(sessionOptions.ioUrl + channel);
        return channels[channel];
    };

    Nv.Session.loginUser = function(usernameInput, passwordInput) {
        lastUsedUsername = usernameInput;

        var systemChannel = Nv.Session.connectToChannel('/system');

        systemChannel.on('userLoggedIn', function(data){
            console.log('User logged in', data);
            if (data.user.username === lastUsedUsername) {
                currentSession = new Nv.Session(data);
            }
            else if (currentSession !== null) {
                currentSession.loginHero(data.hero);
            }
        });

        var eventData = {
                'username': usernameInput,
                'password': passwordInput
            },
            loginEvent = {
                channel: '/system',
                key: 'userLogin',
                data: eventData
            };

        systemChannel.emit(loginEvent.key, loginEvent);
    };

})();