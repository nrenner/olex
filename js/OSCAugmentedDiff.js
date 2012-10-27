/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OSC.js
 */

/**  
 * Class: OpenLayers.Format.OSCAugmented
 * Overpass API augmented diff parser. Create a new instance with the 
 *     <OpenLayers.Format.OSCAugmentedDiff> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OSC>
 */
OpenLayers.Format.OSCAugmentedDiff = OpenLayers.Class(OpenLayers.Format.OSC, {

    initialize: function(options) {
        OpenLayers.Format.OSC.prototype.initialize.apply(this, [options]);
    },

    readAugmenting: function(doc) {
        var result = [];

        doc = this.toDocument(doc);

        var osm = doc.createElement("osm");
        this.appendChildren(osm, doc.getElementsByTagName("erase"));
        this.appendChildren(osm, doc.getElementsByTagName("keep"));

        result = OpenLayers.Format.OSMExt.prototype.read.apply(this, [osm]);

        return result;
    },

    read: function(doc) {
        var result = [];

        doc = this.toDocument(doc);
        
        var osm = doc.createElement("osm");
        this.appendChildren(osm, doc.getElementsByTagName("erase"));
        this.appendChildren(osm, doc.getElementsByTagName("keep"));

        var osc = doc.createElement("osmChange"); 
        this.appendChildren(osc, doc.getElementsByTagName("insert"));

        result = OpenLayers.Format.OSC.prototype.read.apply(this, [osc, osm]);

        return result;
    },

    appendChildren: function(node, children) {
        var clone, i;
        for (i = 0; i < children.length; i++) {
            clone = children[i].cloneNode(true);
            node.appendChild(clone);
        }
    },

    isAugmented: function () {
        return true;
    },

    toDocument: function(stringOrDoc) {
        if (typeof stringOrDoc == "string") { 
            stringOrDoc = OpenLayers.Format.XML.prototype.read.apply(this, [stringOrDoc]);
        }
        return stringOrDoc;
    },
    
    CLASS_NAME: "OpenLayers.Format.OSCAugmentedDiff" 
});     
