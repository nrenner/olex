/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OSC.js
 */

/**
 * Class: OpenLayers.Format.OSCAugmentedDiffIDSorted Overpass API augmented diff
 * parser. Create a new instance with the
 * <OpenLayers.Format.OSCAugmentedDiffIDSorted> constructor.
 * 
 * Inherits from: - <OpenLayers.Format.OSC>
 */
OpenLayers.Format.OSCAugmentedDiffIDSorted = OpenLayers.Class(OpenLayers.Format.OSC, {

    initialize : function(options) {
        OpenLayers.Format.OSC.prototype.initialize.apply(this, [ options ]);
    },

    readAugmenting : function(doc) {
        var object;
        var old = [];
        var change = [];

        doc = this.toDocument(doc);

        var actionElementList = doc.getElementsByTagName("action");
        for ( var i = 0; i < actionElementList.length; i++) {
            var actionNode = actionElementList[i];
            var actionType = actionNode.getAttribute("type");
            switch (actionType) {
            case 'create':
                object = actionNode.firstElementChild;
                this.addFeature(change, object, actionNode, actionType);
                break;
            case 'delete':
            case 'modify':
                // old
                object = actionNode.firstElementChild.firstElementChild;
                this.addFeature(old, object, actionNode, actionType);
                // new
                object = actionNode.lastElementChild.firstElementChild;
                this.addFeature(change, object, actionNode, actionType);
                break;
            case 'info':
                // only needed for relations (not handled yet) 
                break;
            default:
                console.warn('unhandled action type "' + actionType + '"');
            }
        }

        return {
            old : old,
            change : change,
            timestamp : this.getTimestamp(doc)
        };
    },
    
    getTimestamp: function(doc) {
        var timestamp = null;
        var metaList = doc.getElementsByTagName("meta");
        if (metaList && metaList.length > 0) {
            timestamp = metaList[0].getAttribute('osm_base');
        }
        return timestamp;
    },

    read : function(doc) {
        var obj = readAugmenting(doc);
        return obj.change.concat(obj.old);
    },
    
    addFeature:  function(featureList, object, actionNode, actionType) {
        var feature = this.parseFeature(object);
        if (feature) {
            feature.attributes['action'] = this.getActionString(actionNode, actionType);
            if (feature.osm_type === 'node') {
                var waymember = actionNode.getAttribute("waymember");
                feature.used = (waymember && waymember === "yes");
            }
            featureList.push(feature);
        }
    },

    parseFeature: function(object) {
        var feature = null, 
            tags;
        var type = object.tagName.toLowerCase();

        tags = this.getTags(object);

        var geometry = this.parseGeometry[type].apply(this, [object, tags]);
        if (geometry) {
            if (this.internalProjection && this.externalProjection) {
                geometry.transform(this.externalProjection, 
                    this.internalProjection);
            }        
            feature = new OpenLayers.Feature.Vector(geometry, tags);
            
            feature.osm_id = parseInt(object.getAttribute("id"));
            feature.osm_type = type;
            feature.fid = type + "." + feature.osm_id;
        }
        
        return feature;
    },

    getActionString: function(actionNode, actionType) {
        var actionString = actionType;
        var geometryAttr;
        if (actionType === 'modify') {
            geometryAttr = actionNode.getAttribute("geometry");
            if (geometryAttr && geometryAttr === "changed") {
                actionString = 'modify:geometry';
            }
        }
        return actionString;
    },

    /**
     * Property: parseGeometry
     * Properties of this object are the functions that parse geometries based
     *     on their type.
     */
    parseGeometry: {
        node: function(objectNode, tags) {
            var geometry = new OpenLayers.Geometry.Point(
                objectNode.getAttribute("lon"), 
                objectNode.getAttribute("lat"));
            return geometry;
        },
        
        way: function(object, tags) {
            var geometry, node, point;
            var nodeList = object.getElementsByTagName("nd");

            // We know the minimal of this one ahead of time. (Could be -1
            // due to areas/polygons)
            var pointList = new Array(nodeList.length);
            for (var j = 0; j < nodeList.length; j++) {
               node = nodeList[j];
               
               point = new OpenLayers.Geometry.Point(
                       node.getAttribute("lon"), 
                       node.getAttribute("lat"));
               
               // Since OSM is topological, we stash the node ID internally. 
               point.osm_id = parseInt(node.getAttribute("ref"));
               pointList[j] = point;
            }
            
            if (this.isWayArea(pointList, tags)) { 
                geometry = new OpenLayers.Geometry.Polygon(
                    new OpenLayers.Geometry.LinearRing(pointList));
            } else {    
                geometry = new OpenLayers.Geometry.LineString(pointList);
            }
            return geometry;
        },
        
        relation: function(objectNode) {
            // not handled yet
        },
    },

    // use original, not super method, because action is determined from 
    // action not object node
    getMetaAttributes: OpenLayers.Format.OSMMeta.prototype.getMetaAttributes,

    /** 
     * Method: isWayArea
     * Check whether the tags and geometry indicate something is an area.
     *
     * Parameters: 
     * pointList  - {Array(<OpenLayers.Geometry.Point>)} Way nodes
     * tags       - {Object} Way tags
     *  
     * Returns:
     * {Boolean}
     */
    isWayArea: function(pointList, tags) { 
        var poly_shaped = false;
        var poly_tags = false;
        
        if (pointList.length > 2  
            && pointList[0].osm_id === pointList[pointList.length - 1].osm_id) {
            poly_shaped = true;
        }

        for(var key in tags) {
            if (this.areaTags[key]) {
                poly_tags = true;
                break;
            }
        }

        return poly_shaped && poly_tags;            
    }, 

    appendChildren : function(node, children) {
        var clone, i;
        for (i = 0; i < children.length; i++) {
            clone = children[i].cloneNode(true);
            node.appendChild(clone);
        }
    },

    isAugmented : function() {
        return true;
    },

    toDocument : function(stringOrDoc) {
        if (typeof stringOrDoc == "string") {
            stringOrDoc = OpenLayers.Format.XML.prototype.read.apply(this, [ stringOrDoc ]);
        }
        return stringOrDoc;
    },

    CLASS_NAME : "OpenLayers.Format.OSCAugmentedDiffIDSorted"
});
