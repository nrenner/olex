OpenLayers.Control.HoverAndSelectFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature, {
    initialize : function(layers, options) {
        this.hover = true;
        OpenLayers.Control.SelectFeature.prototype.initialize.apply(this, [ layers, options ]);
    },

    clickFeature : function(feature) {
        if (this.hover) {
            this.hover = false;
            if (!this.highlightOnly) {
                // feature already selected by hover, unselect before calling super,
                // which is done to allow select handler to distinguish between hover and click
                this.unselect(feature);
            }
        }
        OpenLayers.Control.SelectFeature.prototype.clickFeature.apply(this, [ feature ]);
        /* delete when sure above is working
        if (this.hover) {
            this.hover = false;
            // highlightOnly == false: do nothing, feature already selected by hover
            // highlightOnly == true: feature not yet selected, call super
            if (this.highlightOnly) {
                OpenLayers.Control.SelectFeature.prototype.clickFeature.apply(this, [ feature ]);
            }
        } else {
            // click on other feature
            OpenLayers.Control.SelectFeature.prototype.clickFeature.apply(this, [ feature ]);
        }
        */
    },

    clickoutFeature : function(feature) {
        OpenLayers.Control.SelectFeature.prototype.clickoutFeature.apply(this, [ feature ]);
        this.hover = true;
    },

    CLASS_NAME : "OpenLayers.Control.HoverAndSelectFeature"
});
