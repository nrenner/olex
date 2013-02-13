var bbox = (function() {

    var drawFeature, transform;
    var map, bboxLayer;

    /**
     * update, activate, deactivate
     */
    var callbacks;

    var style = {
        "default" : {
            fillColor : "#FFD119",
            fillOpacity : 0.1,
            strokeWidth : 2,
            strokeColor : "#333",
            strokeDashstyle : "solid"
        },
        "select" : {
            fillOpacity : 0.2,
            strokeWidth : 2.5,
        },
        "temporary" : {
            fillColor : "#FFD119",
            fillOpacity : 0.1,
            strokeDashstyle : "longdash"
        },
        "transform" : {
            display : "${getDisplay}",
            cursor : "${role}",
            pointRadius : 6,
            fillColor : "rgb(158, 158, 158)",
            fillOpacity : 1,
            strokeColor : "#333",
            strokeWidth : 2,
            strokeOpacity : 1
        }
    };

    function createStyleMap() {

        var styleMap = new OpenLayers.StyleMap({
            //"default" : new OpenLayers.Style(defaultStyle),
            "default" : new OpenLayers.Style(style["default"]),
            "select" : new OpenLayers.Style(style["select"]),
            "temporary" : new OpenLayers.Style(style["temporary"]),
            // render intent for TransformFeature control
            "transform" : new OpenLayers.Style(style["transform"], {
                context : {
                    getDisplay : function(feature) {
                        // Hide transform box, as it's styling is limited because of underlying bbox feature.
                        // Instead, the render intent of the bbox feature is assigned separately.
                        return feature.geometry.CLASS_NAME === "OpenLayers.Geometry.LineString" ? "none" : "";
                    },
                }
            })
        });
        /* debug
        var orig = OpenLayers.StyleMap.prototype.createSymbolizer;
        OpenLayers.StyleMap.prototype.createSymbolizer = function(feature, intent) {
            var ret = orig.apply(this, arguments);
            console.log(intent + '( ' + this.extendDefault + '): ' + JSON.stringify(ret));
            return ret;
        };
        */

        return styleMap;
    }

    function featureInsert(feature) {
        drawFeatureDeactivate();
        callbacks.update(getBBox(feature));
    }

    function onTransformComplete(evt) {
        callbacks.update(getBBox(evt.feature));
    }

    function drawFeatureActivate() {
        drawFeature.activate();
        if (transform.active) {
            transform.deactivate();
        }
        bboxLayer.destroyFeatures();

        // crosshair cursor
        OpenLayers.Element.addClass(map.viewPortDiv, "olDrawBox");

        callbacks.activate();
    }

    function drawFeatureDeactivate() {
        drawFeature.deactivate();

        // default cursor (remove crosshair cursor)
        OpenLayers.Element.removeClass(map.viewPortDiv, "olDrawBox");

        callbacks.deactivate();
    }

    function switchActive() {
        if (!drawFeature.active) {
            drawFeatureActivate();
        } else {
            drawFeatureDeactivate();
        }
    }

    function addControls(pMap, pBboxLayer, pCallbacks) {

        callbacks = pCallbacks;
        bboxLayer = pBboxLayer;
        map = pMap;

        // draw control
        /* TODO: use feature label or popup to update coordinates while drawing
        var onMove = function(geometry) {
            updateInfo(new OpenLayers.Feature.Vector(geometry));
        };
        */
        var polyOptions = {
            irregular : true,
            // allow dragging beyond map viewport 
            documentDrag : true
        };
        drawFeature = new OpenLayers.Control.DrawFeature(bboxLayer, OpenLayers.Handler.RegularPolygon, {
            handlerOptions : polyOptions
        /* 
        ,callbacks : {
            move : onMove
        }
        */
        });
        drawFeature.featureAdded = featureInsert;
        map.addControl(drawFeature);

        // feature edit control (move and resize), activated by select control
        transform = new OpenLayers.Control.TransformFeature(bboxLayer, {
            renderIntent : "transform",
            rotate : false,
            irregular : true
        });
        transform.events.register("transformcomplete", transform, onTransformComplete);
        map.addControl(transform);

        // select control
        // - highlight feature on hover to indicate that it is clickable
        // - activate editing on click (select), deactivate editing on click on map (unselect)
        var select = new OpenLayers.Control.HoverAndSelectFeature(bboxLayer, {
            hover : true,
            highlightOnly : true,
            onSelect : function(feature) {
                select.unhighlight(feature);
                transform.setFeature(feature);
                feature.renderIntent = "temporary";
                bboxLayer.drawFeature(feature);
            },
            onUnselect : function(feature) {
                transform.unsetFeature();
                feature.renderIntent = "default";
                bboxLayer.drawFeature(feature);
            }
        });

        map.addControl(select);
        select.activate();
    }

    function getBBox(feature) {
        return roundAndTransform(feature.geometry.getBounds());
    }

    function roundAndTransform(aBounds) {
        var bounds = aBounds.clone().transform(map.getProjectionObject(), map.displayProjection);
        
        var decimals = Math.floor(map.getZoom() / 3);
        var multiplier = Math.pow(10, decimals);

        // custom float.toFixed function that rounds to integer when .0
        // see OpenLayers.Bounds.toBBOX
        var toFixed = function(num) {
            return Math.round(num * multiplier) / multiplier;
        };

        // (left, bottom, right, top)
        var box = new OpenLayers.Bounds(
            toFixed(bounds.left),
            toFixed(bounds.bottom),
            toFixed(bounds.right),
            toFixed(bounds.top)
        );
        
        return box;
    }

    function addBBoxFromViewPort() {
        var bounds = map.getExtent();
        bboxLayer.addFeatures([new OpenLayers.Feature.Vector(bounds.toGeometry())]);

        return roundAndTransform(bounds);
    }

    return {
        style: style,
        createStyleMap : createStyleMap,
        addControls : addControls,
        switchActive : switchActive,
        addBBoxFromViewPort : addBBoxFromViewPort
    };
})();