/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OSC.js
 */

/**  
 * Class: OpenLayers.Format.OSCAugmented
 * Augmented OSC (OSM change file) parser. Create a new instance with the 
 *     <OpenLayers.Format.OSCAugmented> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OSC>
 */
OpenLayers.Format.OSCAugmented = OpenLayers.Class(OpenLayers.Format.OSC, {

    initialize: function(options) {
        OpenLayers.Format.OSC.prototype.initialize.apply(this, [options]);
    },

    readAugmenting: function(augOscDoc) {
        var result = [];

        augOscDoc = this.toDocument(augOscDoc);

        // extract 'augment' node tree and pass to OSM.read (treat as OSM XML doc)
        var augmentNode = this.getAugmentNode(augOscDoc);
        if (augmentNode) {
            result = OpenLayers.Format.OSMExt.prototype.read.apply(this, [augmentNode]);
        }

        return result;
    },

    /**
     * NOTE: modifies the passed document (removes the augment node)!
     */
    read: function(augOscDoc) {
        var result = [];

        augOscDoc = this.toDocument(augOscDoc);
        
        // extract and delete 'augment' node tree and pass both to OSC.read
        // (treat 'augment' node as separate OSM XML doc)
        var augmentNode = this.getAugmentNode(augOscDoc);
        if (augmentNode) {
            augmentNode.parentNode.removeChild(augmentNode);
            result = OpenLayers.Format.OSC.prototype.read.apply(this, [augOscDoc, augmentNode]);
        } else {
            result = OpenLayers.Format.OSC.prototype.read.apply(this, [augOscDoc]);
        }
        
        return result;
    },
    
    isAugmented: function(augOscDoc) {
        augOscDoc = this.toDocument(augOscDoc);
        
        var augment_list = augOscDoc.getElementsByTagName("augment");
        return augment_list.length > 0;
    },

    toDocument: function(stringOrDoc) {
        if (typeof stringOrDoc == "string") { 
            stringOrDoc = OpenLayers.Format.XML.prototype.read.apply(this, [stringOrDoc]);
        }
        return stringOrDoc;
    },

    getAugmentNode: function(doc) {
        var result = null;
        var augment_list = doc.getElementsByTagName("augment");
        if (augment_list.length === 1) {
            result = augment_list[0];
        } else {
            console.warn('Exactly one "augment" section expected in OSC, found: ' + (augment_list.length));
        }
        return result;
    },
    
    CLASS_NAME: "OpenLayers.Format.OSCAugmented" 
});     
