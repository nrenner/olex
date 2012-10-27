OpenLayers.Control.LayerSwitcherBorder = OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {

    borderDiv: null,

    initialize: function(options) {
        OpenLayers.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
    },

    draw: function() {
        this.borderDiv = OpenLayers.Control.prototype.draw.apply(this);
        this.div = null;
        /*
        this.borderDiv = document.createElement("div");
        //OpenLayers.Element.addClass(this.borderDiv, "border");
        OpenLayers.Element.addClass(this.borderDiv, this.displayClass);
        if (!this.allowSelection) {
            this.borderDiv.className += " olControlNoSelect";
            this.borderDiv.setAttribute("unselectable", "on", 0);
            this.borderDiv.onselectstart = OpenLayers.Function.False; 
        }    
        */

        OpenLayers.Control.LayerSwitcher.prototype.draw.apply(this);
        
        //this.div.style.width = this.borderDiv.style.width;
        //this.borderDiv.style.width = "auto";
        this.div.className = "layerSwitcherDiv";
        this.div.style.position = "";
        //OpenLayers.Element.addClass(this.div, "layerSwitcherDiv");
        //this.borderDiv.id = this.div.id;
        this.div.id = this.div.id + "_layerSwitcherDiv";
        
        this.maximizeDiv.style.position = "";

        this.borderDiv.appendChild(this.div);
        
//        OpenLayers.Util.modifyAlphaImageDiv(this.maximizeDiv, null, null, {w: 22, h: 22});
        
        return this.borderDiv;
    },

    maximizeControl: function(e) {

        // set the div's width and height to empty values, so
        // the div dimensions can be controlled by CSS
//        this.div.style.width = "";
//        this.div.style.height = "";
        this.layersDiv.style.display = "";

        this.showControls(false);

        if (e != null) {
            OpenLayers.Event.stop(e);                                            
        }
    },

    minimizeControl: function(e) {

        // to minimize the control we set its div's width
        // and height to 0px, we cannot just set "display"
        // to "none" because it would hide the maximize
        // div
//        this.div.style.width = "0px";
//        this.div.style.height = "0px";
        this.layersDiv.style.display = "none";

        this.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);                                            
        }
    }

    // CLASS_NAME: keep parent name because CSS classes are named after this
});
