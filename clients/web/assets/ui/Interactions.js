Nv.Interactions = {
    init: function(hero, containerId, areaMap) {
        // setup movement events
        var elem = document.getElementById('container'),
            elemLeft = elem.offsetLeft,
            elemTop = elem.offsetTop;

        // Add event listener for `click` events.
        elem.addEventListener('click', function(event) {
            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

           hero.moveTo(x, y, areaMap);

        }, false);
    }
};