(function() {
    var channels = {},
        lastUsedUsername = null,
        sessionOptions = {},
        currentSession = null,
        eventsInitialized = false;

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
        var systemChannel = Nv.Session.connectToChannel('/system');

        systemChannel.on('userLoggedOut', function(data){
            if (currentSession !== null) {
                currentSession.logoutHero(data.hero_id);
            }
        });

    }

    function initializeHUD(session, hero) {
        session.hud = new Nv.HUD({
            container: '#hud-container',
            hero: hero,
            session: session
        });

        Nv.Session.showGameError = function(message){
            return session.hud.showGameError(message);
        };
    }

    function createHero(session, heroConfig, protagonist) {

        var hero = new Nv.Hero(session.map, heroConfig);
        hero.skipEvents = !protagonist;
        session.map.heroEnter(hero, protagonist);

        return hero;
    }

    function createProtagonist(session, heroConfig) {
        heroConfig.image = session.images.heroSprite;
        var hero = createHero(session, heroConfig, true);
        session.hero = hero;
    }

    function enterMap(session, mapConfig) {
        var stage = new Kinetic.Stage({
            container: session.container,
            width: mapConfig.width,
            height: mapConfig.height
        });

        delete session.map;
        session.map = null;

        mapConfig.baseImage = session.images.tileSet;
        mapConfig.session = session;

        var areaMap = new Nv.Map(mapConfig);
        areaMap.addLayersToStage(stage);
        session.map = areaMap;

        stage.draw();
    }

    Nv.Session = function(sessionData) {
        this.hero = null;
        this.user = sessionData.user;
        this.map = null;
        this.config = sessionData;
        this.hud = null;

        this.images = {};

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

        destroy: function() {
            this.emitEvent('/system', 'userLogout', {
                'username': lastUsedUsername,
                'hero_id': this.hero.id
            });
        },

        start: function() {
            setupEvents(this);

            // setup map
            enterMap(this, this.config.map);

            // add main hero
            createProtagonist(this, this.config.hero);

            initializeHUD(this, this.config.hero);

            Nv.Interactions.init(this.hero, this.container);
        },

        loginHero: function(heroConfig) {
            // if hero is on current map
            if (heroConfig.position.map === currentSession.map.key) {
                console.log(heroConfig.position);
                var imagesToLoad = {heroSprite: heroConfig.heroSprite};
                loadImages(imagesToLoad, function(images){

                    heroConfig.image = images.heroSprite;
                    var hero = createHero(currentSession, heroConfig);

                    currentSession.map.heroEnter(hero);
                });

                // trigger event for hud
            }
        },

        logoutHero: function(hero_id) {
            this.map.heroLeave(hero_id);
        }
    };

    Nv.sessionInstance = function() {
        return currentSession;
    };

    Nv.Session.initStatic = function(options) {
        sessionOptions = options;
    };

    Nv.Session.connectToChannel = function(channel) {
        if (typeof channels[channel] !== 'undefined') {
            return channels[channel];
        }
        channels[channel] = io(sessionOptions.ioUrl + channel);
        channels[channel].on('systemError', Nv.Session.showError);
        channels[channel].on('gameError', function(message){
            Nv.Session.showGameError(message);
        });
        return channels[channel];
    };

    Nv.Session.showError = function(error) {
        var message = error.message ? error.message : error;
        alert(message);
    };

    Nv.Session.showGameError = Nv.Session.showError;

    Nv.Session.loginUser = function(usernameInput, passwordInput) {
        lastUsedUsername = usernameInput;

        var systemChannel = Nv.Session.connectToChannel('/system');

        var eventData = {
                'username': usernameInput,
                'password': passwordInput
            },
            loginEvent = {
                channel: '/system',
                key: 'userLogin',
                data: eventData
            };

        if (!eventsInitialized) {
            systemChannel.on('userLoggedIn', function(data){
                console.log('User logged in', data);
                if (data.user.username === lastUsedUsername) {
                    currentSession = new Nv.Session(data);
                }
                else if (currentSession !== null) {
                    currentSession.loginHero(data.hero);
                }
            });

            // systemChannel.on('systemError', Nv.Session.showError);
            // systemChannel.on('gameError', Nv.Session.showGameError);

            eventsInitialized = true;
        }

        systemChannel.emit(loginEvent.key, loginEvent);
    };

})();