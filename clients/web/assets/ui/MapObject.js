(function() {

    MapObject = function(map, width, height, position, config) {
        config = config || {};

        var groupConfig = {
            x: position.x,
            y: position.y,
        };

        Kinetic.Group.call(this, groupConfig);

        this.skipEvents = false;

        this.width = width;
        this.height = height;
        this.map = map;
        this.layer = config.layer;
        this.tooltipText = config.tooltipText;

        var tooltip = {
            x: 0,
            y: 0,
            text: '',
            fontSize: 12,
            fontFamily: 'Calibri',
            textFill: "white",
            fill: "white",
            visible: false
        };

        tooltip = new Kinetic.Text(tooltip);
        tooltip.setX(tooltip.getX() - tooltip.getTextWidth() / 2 + this.width / 2);
        tooltip.setY(tooltip.getY() + this.height);
        this.tooltip = tooltip;

        this.rect = new Kinetic.Rect({
            x: tooltip.getX(),
            y: tooltip.getY(),
            width: tooltip.getTextWidth(),
            height: tooltip.getTextHeight(),
            fill: 'black',
            visible: false
        });

        this.add(this.rect);
        this.add(this.tooltip);

        var item = this;

        if (this.tooltipText) {
            this.on('mouseover', function() {
                item.showTooltip(item.tooltipText);
            });

            this.on('mouseout', function() {
                item.hideTooltip();
            });
        }

        this.on('click', this.mapObjectClicked);
    };

    MapObject.prototype = {

        emitEvent: function(channel, eventKey, eventData) {
            if (!this.skipEvents) {
                Nv.sessionInstance().emitEvent(channel, eventKey, eventData);
            }
        },

        showTooltip: function(message) {
            this.tooltip.setText(message);
            this.rect.setX(this.tooltip.getX());
            this.rect.setY(this.tooltip.getY());
            this.rect.setWidth(this.tooltip.getTextWidth());
            this.rect.setHeight(this.tooltip.getTextHeight());

            this.tooltip.show();
            this.rect.show();

            this.layer.draw();
            document.body.style.cursor = 'pointer';
        },

        hideTooltip: function(message) {
            this.tooltip.hide();
            this.rect.hide();

            this.layer.draw();
            document.body.style.cursor = 'default';
        },

        hideFromUI: function() {
            this.hide();
            this.layer.draw();
        },

        getCollisionDimentions: function(){
            return {
                x: this.getX(),
                y: this.getY(),
                width: this.width,
                height: this.height
            };
        },

        mapObjectClicked: function() {
            
        }

    };

    Kinetic.Util.extend(MapObject, Kinetic.Group);

    Nv.MapObject = MapObject;
})();