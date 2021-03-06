$(function() {
    var username = null;
    var session = null;

    // set global session properties
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

    // setup login form events
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

    // var u = window.location.search.replace("?", "");
    // if (u) {
    //     Nv.Session.loginUser(u, 'test');
    // }

});