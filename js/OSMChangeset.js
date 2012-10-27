/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Projection.js
 */

/**  
 * Class: OpenLayers.Format.OSM
 * OSM parser. Create a new instance with the 
 *     <OpenLayers.Format.OSM> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.OSMChangeset = OpenLayers.Class(OpenLayers.Format.XML, {

    metaAttributes: ['user', 'uid', 'created_at', 'closed_at', 'open', 'min_lat', 'min_lon', 'max_lat', 'max_lon'],

    /**
     * Constructor: OpenLayers.Format.OSM
     * Create a new parser for OSM.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {

        // OSM coordinates are always in longlat WGS84
        this.externalProjection = new OpenLayers.Projection("EPSG:4326");
        
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },
    
    /**
     * APIMethod: read
     * Return changeset from a OSM changeset doc
     
     * Parameters:
     * doc - {Element} 
     *
     * Returns:
     * Array({<OpenLayers.Feature.Vector>})
     */
    read: function(doc) {
        if (typeof doc == "string") { 
            doc = OpenLayers.Format.XML.prototype.read.apply(this, [doc]);
        }

        var feat_list = [];
        var changesetNode = null;
        var nodeList = doc.getElementsByTagName("changeset");
        if (nodeList.length > 0) {
            changesetNode = nodeList[0];
            var tags = this.getTags(changesetNode);
    
            // left, bottom, right, top
            var bounds = new OpenLayers.Bounds(tags.min_lon, tags.min_lat, tags.max_lon, tags.max_lat);
            var geometry = bounds.toGeometry();
            if (this.internalProjection && this.externalProjection) {
                geometry.transform(this.externalProjection, 
                    this.internalProjection);
            }        
            var feat = new OpenLayers.Feature.Vector(geometry, tags);
            feat.osm_id = parseInt(changesetNode.getAttribute("id"));
            feat.fid = "changeset." + feat.osm_id;
            feat_list.push(feat);
        } 

        return feat_list;
    },

    getTags: OpenLayers.Format.OSMMeta.prototype.getTags,
    
    getMetaAttributes: OpenLayers.Format.OSMMeta.prototype.getMetaAttributes,

    CLASS_NAME: "OpenLayers.Format.OSMChangeset" 
});     
