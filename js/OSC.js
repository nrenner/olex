/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OSMExt.js
 */

/**  
 * Class: OpenLayers.Format.OSC
 * OSC (OSM change file) parser. Create a new instance with the 
 *     <OpenLayers.Format.OSC> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OSMExt>
 */
OpenLayers.Format.OSC = OpenLayers.Class(OpenLayers.Format.OSMExt, {

    initialize: function(options) {
        OpenLayers.Format.OSMExt.prototype.initialize.apply(this, [options]);

        this.metaAttributes.push('action');
    },

    // osmDoc optional
    read: function(doc, osmDoc) {
        // copied and modified version of OpenLayers.Format.OSM.read
        
        if (typeof doc == "string") { 
            doc = OpenLayers.Format.XML.prototype.read.apply(this, [doc]);
        }

        // OSM XML
        var osmNodes = {};
        if (osmDoc) {
            if (typeof osmDoc == "string") { 
                osmDoc = OpenLayers.Format.XML.prototype.read.apply(this, [osmDoc]);
            }
            osmNodes = this.getNodes(osmDoc);
        }

        // OSC
        var nodes = this.getNodes(doc);
        var ways = this.getWays(doc);
        
        // Geoms will contain at least ways.length entries.
        var feat_list = new Array(ways.length);
        
        for (var i = 0; i < ways.length; i++) {
            // no fixed length, nodes might be missing
            var point_list = [];
            
            var poly = this.isWayArea(ways[i]) ? 1 : 0; 
            for (var j = 0; j < ways[i].nodes.length; j++) {
               var node = nodes[ways[i].nodes[j]];

               // if not in OSC get referenced node from augmenting file (OSM XML)
               if (!node) {
                  node = osmNodes[ways[i].nodes[j]];
               }
               if (node) {
                   var point = new OpenLayers.Geometry.Point(node.lon, node.lat);
                   
                   // Since OSM is topological, we stash the node ID internally. 
                   point.osm_id = parseInt(ways[i].nodes[j]);
                   //point_list[j] = point;
                   point_list.push(point);
                   
                   // We don't display nodes if they're used inside other 
                   // elements.
                   node.used = true; 
               } else if (osmDoc) {
                   console.warn('node "' + ways[i].nodes[j] + '" referenced by way "' + ways[i].id + '" not found');
               }
            }
            if (point_list.length === 0 && ways[i].tags['action'] !== 'delete') {
                console.warn('no nodes for way "' + ways[i].id + '" found - way will not appear on map');
            }
            var geometry = null;
            if (poly) { 
                geometry = new OpenLayers.Geometry.Polygon(
                    new OpenLayers.Geometry.LinearRing(point_list));
            } else {    
                geometry = new OpenLayers.Geometry.LineString(point_list);
            }
            if (this.internalProjection && this.externalProjection) {
                geometry.transform(this.externalProjection, 
                    this.internalProjection);
            }        
            var feat = new OpenLayers.Feature.Vector(geometry,
                ways[i].tags);
            feat.osm_id = parseInt(ways[i].id);
            feat.fid = "way." + feat.osm_id;
            feat_list[i] = feat;
        } 
        for (var node_id in nodes) {
            var node = nodes[node_id];
            if (!node.used || this.checkTags) {
                var tags = null;
                
                if (this.checkTags) {
                    var result = this.getTags(node.node, true);
                    if (node.used && !result[1]) {
                        continue;
                    }
                    tags = result[0];
                } else { 
                    tags = this.getTags(node.node);
                }    
                
                var feat = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(node['lon'], node['lat']),
                    tags);
                if (this.internalProjection && this.externalProjection) {
                    feat.geometry.transform(this.externalProjection, 
                        this.internalProjection);
                }        
                feat.osm_id = parseInt(node_id); 
                feat.fid = "node." + feat.osm_id;
                feat.used = node.used;
                feat_list.push(feat);
            }   
            // Memory cleanup
            node.node = null;
        }        
        return feat_list;
    },
    
    getMetaAttributes: function(dom_node) {
        var meta = OpenLayers.Format.OSMMeta.prototype.getMetaAttributes.apply(this, [dom_node]);
        meta['action'] = this.getActionString(dom_node);
        return meta;
    },
    
    getActionString: function(dom_node) {
        var action = dom_node.parentNode.tagName;
        return action;
    },
    
    CLASS_NAME: "OpenLayers.Format.OSC" 
});     
