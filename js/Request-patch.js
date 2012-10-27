(function() {
    /* 
     * Patches OpenLayers.Request.issue. 
     * Adds config option "disableXRequestedWith" to disable setting X-Requested-With header.
     * (Error in Chrome: "Request header field X-Requested-With is not allowed by Access-Control-Allow-Headers")
     * see https://github.com/openlayers/openlayers/issues/188
     */

    var funcOldStr = OpenLayers.Request.issue.toString();
    var replacement = "customRequestedWithHeader === false && !(config.disableXRequestedWith === true)";

    // support both compressed and uncompressed
    var funcNewStr = funcOldStr.replace("customRequestedWithHeader===false", replacement);
    funcNewStr = funcNewStr.replace("customRequestedWithHeader === false", replacement);

    eval('OpenLayers.Request.issue = ' + funcNewStr);
    console.warn('patched OpenLayers.Request.issue');
    //console.debug(OpenLayers.Request.issue);
})();
