$(function() {
    var movementSocket = io('http://localhost:8080/movement');

    movementSocket.on('heroMoved', function(data){
        console.log('received', data);
    });

    window.movementSocket = movementSocket;

    function loadImages(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        for (var src in sources) {
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

    function initStage(images) {
        var stage = new Kinetic.Stage({
            container: "container",
            width: 640,
            height: 640
        });
        var layer = new Kinetic.Layer();

        // setup hero
        var hero = new Nv.Hero({

            position: {
                x: 320,
                y: 320
            },

            image: images.spaceGuy,

            animations: {
                idle: [
                    [1, 2],
                ],

                walk: [
                    [0, 2],
                    [1, 2],
                    [2, 2]
                ],
            },

            name: 'skovachev',

            id: 1,

            channels: {
                '/movement': movementSocket
            }
        });

        layer.add(hero);

        hero.animate();

        // setup map
        var mapConfig = {
            tileSize: 32,
            baseImage: images.tileSet,
            width: 640,
            height: 640,

            tilesConfig: {
                imageX: 5,
                imageY: 18,
                stepsHorizontalAllowed: 2,
                stepsVerticalAllowed: 2,
            }
        };
        var areaMap = new Nv.Map(mapConfig);

        areaMap.addLayersToStage(stage);
        stage.add(layer);
        stage.draw();

        Nv.Interactions.init(hero, 'container', areaMap);

        // stage.onFrame(function(frame){//wasd, arrows

        //     //The order here allows for down+left or right to have down's animation
        //     moveguy(3, 37, 65, -1,0, input, spaceGuyImg, collisions);//left, a
        //     moveguy(1, 39, 68, 1,0, input, spaceGuyImg, collisions);//right, d
        //     moveguy(0, 38, 87, 0,-1, input, spaceGuyImg, collisions);//up, w
        //     moveguy(2, 40, 83, 0,1, input, spaceGuyImg, collisions);//down, s

        //     defaultdir(spaceGuyImg); //checks to stand still
        //     spaceGuyImg.count++; //make walk cycle sooner
        //     layer.draw(); //think this might be faster than stage.draw()? not sure...
        // });

        // stage.start();
    }

    // function defaultdir(spaceGuyImg) {
    //     if (spaceGuyImg.count > 10) {
    //         spaceGuyImg.srcx = spaceGuyImg.col * spaceGuyImg.srcwidth; //switch to middle column
    //         spaceGuyImg.count %= 10;
    //     }
    // }

    // function moveguy(row, in1, in2, xfac, yfac, input, spaceGuyImg, collisions) {
    //     if (input[in1] || input[in2]) //these are input values to be checked
    //     {
    //         tS = 32;
    //         spaceGuyImg.srcy = spaceGuyImg.srcheight * row; //this changes the row
    //         spaceGuyImg.x += spaceGuyImg.speed * xfac; //-1,1,0 => left, right, stationary
    //         spaceGuyImg.y += spaceGuyImg.speed * yfac; //-1,1,0 => up, down, stationary
    //         if (spaceGuyImg.x > 20 * tS)
    //             spaceGuyImg.x -= 21 * tS;
    //         if (spaceGuyImg.y > 20 * tS)
    //             spaceGuyImg.y -= 21 * tS;
    //         if (spaceGuyImg.x < -tS)
    //             spaceGuyImg.x += 21 * tS;
    //         if (spaceGuyImg.y < -tS)
    //             spaceGuyImg.y += 21 * tS;

    //         var i = Math.floor((spaceGuyImg.x - 16) / tS + 1) //collisions were left shifted
    //         var j = Math.floor((spaceGuyImg.y + 10) / tS + 1) //32 is the bG tile size
    //         if (collisions[j] && collisions[j][i]) //don't allow movement if true
    //         {
    //             spaceGuyImg.x -= spaceGuyImg.speed * xfac; //-1,1,0 => left, right, stationary
    //             spaceGuyImg.y -= spaceGuyImg.speed * yfac; //-1,1,0 => up, down, stationary
    //         }

    //         if (spaceGuyImg.count > 6) //ready to change walk columns?
    //         {
    //             spaceGuyImg.srcx += 2 * spaceGuyImg.srcwidth; //first and last column
    //             if (spaceGuyImg.srcx >= spaceGuyImg.srcwidth * 3) //overflow? start at srcx=0
    //                 spaceGuyImg.srcx = 0; //bring the walk cycle to the far left column
    //             spaceGuyImg.count %= 6; //start the count for the walk cycle over again
    //         }
    //     }
    // }

    var sources = {
        spaceGuy: "assets/tileset/space_guy.png",
        //https://github.com/silveira/openpixels/blob/master/open_chars.xcf
        tileSet: "assets/tileset/free_tileset_CC.png", //CC-By-SA
        //http://silveiraneto.net/tag/tileset/
        //                spaceGuy: "/kineticjs/tiletest/ranger_m.png" //32 by 36, ranger
        //http://opengameart.org/content/antifareas-rpg-sprite-set-1-enlarged-w-transparent-background
    };
    loadImages(sources, initStage);
});