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

        // setup battle events
        var battleSocket = Nv.sessionInstance().connectToChannel('/battle');

        battleSocket.on('battleStarted', function(data){
            var attacker = Nv.sessionInstance().map.getHero(data.heroId);
            var otherHero = Nv.sessionInstance().map.getHero(data.otherHeroId);

            if (!attacker.inBattle) {
                var battle = new Nv.Battle(otherHero, attacker);
                battle.firstAttackBy(data.firstAttacker);
            }
        });

        battleSocket.on('heroAttacked', function(data){
            var attacker = Nv.sessionInstance().map.getHero(data.attacker);
            var defender = Nv.sessionInstance().map.getHero(data.defender);

            if (!attacker.inBattle) {
                var battle = new Nv.Battle(defender, attacker);
                battle.firstAttackBy(attacker.id);
            }
            attacker.inBattle.performAttackBy(attacker);
        });

        battleSocket.on('heroFled', function(data){
            var fleeingHero = Nv.sessionInstance().map.getHero(data.fleeingHero);

            if (fleeingHero.inBattle) {
                fleeingHero.inBattle.heroFled(fleeingHero);
            }
        });

        battleSocket.on('heroDied', function(data){
            var deceasedHero = Nv.sessionInstance().map.getHero(data.deceasedId);

            if (deceasedHero.inBattle) {
                deceasedHero.inBattle.resolveBattleWithDeath(deceasedHero);
            }
        });
    }

    function initializeHUD(session, hero) {
        session.hud = new Nv.HUD({
            container: '#hud-container',
            hero: hero,
            session: session
        });

        Nv.Session.showGameMessage = function(message){
            return session.hud.showGameMessage(message);
        };
    }

    function createHero(session, heroConfig, protagonist) {
        heroConfig.layer = session.map.layers['heroLayer'];
        var hero = new Nv.Hero(session.map, heroConfig);
        hero.skipEvents = !protagonist;
        session.map.heroEnter(hero, protagonist);

        return hero;
    }

    function createOnlineHeroes(session, onlineHeroes) {
        onlineHeroes = _.chain(onlineHeroes).filter(function(hero){
            return hero.id !== session.hero.id;
        }).each(function(hero){
            hero.image = session.images[hero.heroSprite];
            hero = createHero(session, hero, false);
            session.map.heroEnter(hero);
        });
    }

    function startBattles(session, battles) {
        _.each(battles, function(battle){
            var hero = Nv.sessionInstance().map.getHero(battle.heroId);
            var otherHero = Nv.sessionInstance().map.getHero(battle.otherHeroId);

            // start battle between combatants
            new Nv.Battle(otherHero, hero);
        });
    }

    function createProtagonist(session, heroConfig) {
        heroConfig.image = session.images[heroConfig.heroSprite];
        var hero = createHero(session, heroConfig, true);
        session.hero = hero;
    }

    function loadAreaEntrances(session, areas) {
        _.each(areas, function(areaConfig){
            var area = new Nv.AreaEntrance(session.map, areaConfig);
            session.map.addToLayer(area, 'areasLayer');
        });
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

        return stage;
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
        imagesToLoad['battle'] = 'assets/images/battle.png';

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
            var stage = enterMap(this, this.config.map);

            // add main hero
            createProtagonist(this, this.config.hero);

            createOnlineHeroes(this, this.config.map.onlineHeroes);

            startBattles(this, this.config.battles);

            loadAreaEntrances(this, this.config.areas);

            initializeHUD(this, this.config.hero);

            stage.draw();

            Nv.Interactions.init(this.hero, this.container);
        },

        loginHero: function(heroConfig) {
            // if hero is on current map
            if (heroConfig.position.map === currentSession.map.key) {
                var imagesToLoad = {};
                imagesToLoad[heroConfig.heroSprite] = 'assets/images/heroes/' + heroConfig.heroSprite;
                loadImages(imagesToLoad, function(images){

                    heroConfig.image = images[heroConfig.heroSprite];
                    var hero = createHero(currentSession, heroConfig);

                    currentSession.map.heroEnter(hero);
                    Nv.Session.showGameMessage('Hero ' + hero.name + ' entered area.');
                });
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
            Nv.Session.showGameMessage(message);
        });
        return channels[channel];
    };

    Nv.Session.showError = function(error) {
        var message = error.message ? error.message : error;
        alert(message);
    };

    Nv.Session.showGameMessage = function(){};

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
                // console.log('User logged in', data);
                if (data.user.username === lastUsedUsername) {
                    currentSession = new Nv.Session(data);
                }
                else if (currentSession !== null) {
                    currentSession.loginHero(data.hero);
                }
            });

            // systemChannel.on('systemError', Nv.Session.showError);
            // systemChannel.on('gameError', Nv.Session.showGameMessage);

            eventsInitialized = true;
        }

        systemChannel.emit(loginEvent.key, loginEvent);
    };

})();