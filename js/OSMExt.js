/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OSMMeta.js
 */
 
/**  
 * Class: OpenLayers.Format.OSMExt
 * Extended OSM parser. Returns all nodes (including way nodes) and all tags, 
 * without the overhead of checking interestingTagsExclude, which is ignored.
 * Create a new instance with the <OpenLayers.Format.OSMExt> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OSMMeta>
 */
OpenLayers.Format.OSMExt = OpenLayers.Class(OpenLayers.Format.OSMMeta, {
    
    initialize: function(options) {
        OpenLayers.Format.OSMMeta.prototype.initialize.apply(this, [options]);

        // return used nodes (way nodes) as separate entities (check is ignored)
        this.checkTags = true;
    },

    getTags: function(dom_node, interesting_tags) {
        // ignore interesting_tags parameter, pass false to avoid check
        var tags = OpenLayers.Format.OSMMeta.prototype.getTags.apply(this, [dom_node, false]);
        // all tags are interesting
        return interesting_tags ? [tags, true] : tags;
    },
    
    CLASS_NAME: "OpenLayers.Format.OSMExt" 
});     
