$(function() {
    var username = null;
    var session = null;

    //http://silveiraneto.net/tag/tileset/
    //http://opengameart.org/art-search-advanced?field_art_tags_tid=tileset
    //http://opengameart.org/content/base-pixel-art-for-3d-pixelish-rpg
    //                spaceGuy: "/kineticjs/tiletest/ranger_m.png" //32 by 36, ranger
    //http://opengameart.org/content/antifareas-rpg-sprite-set-1-enlarged-w-transparent-background
    //https://github.com/silveira/openpixels/blob/master/open_chars.xcf

    Nv.Session.initStatic({

        ioUrl: window.location.protocol + '//' + window.location.hostname + ':8080',

        container: 'container',

        onCreate: function(session) {

            $('#login').remove();
            $('body').addClass('game-started');

            // catch logout event
            $(window).bind("beforeunload", function() {
                if (session) {
                    session.destroy();
                }
            });
        }
    });


    $('#login form').on('submit', function(e) {
        e.preventDefault();

        var $form = $(this),
            usernameInput = $form.find('#username').val(),
            passwordInput = $form.find('#password').val();

        if (!usernameInput || !passwordInput) {
            alert('Please enter your login or registration credentials');
        } else {
            Nv.Session.loginUser(usernameInput, passwordInput);
        }

        return false;
    });

    // Nv.Session.loginUser('user' + (Math.random() * 1000), 'asd');
    // Nv.Session.loginUser('stefan', 'test');

});