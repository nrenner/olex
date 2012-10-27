/*
 * Reads files using HTML5 file API
 *  
 * derived from http://www.html5rocks.com/en/tutorials/file/dndfiles/
 */
function FileReaderControl(onLoadCallback) {
    this.onLoadCallback = onLoadCallback;
}

FileReaderControl.prototype.activate = function() {
    if (window.File && window.FileReader && window.FileList) {
        document.getElementById('fileinput').addEventListener('change', _.bind(this.handleFileSelect, this), false);

        // TODO map.div
        var dropZone = document.getElementById('map_div'); 
        dropZone.addEventListener('dragover', this.handleDragOver, false);
        dropZone.addEventListener('drop', _.bind(this.handleFileSelect, this), false);
    } else {
        // File API not supported
        document.getElementById('fileinput').disabled = true;
        console.warn('Browser does not support the HTML5 File API!');
    }    
};

/*
FileReaderControl.prototype.handleLoad = function(text, fileName) {
    var features = this.formatManager.read(text);
    changes.addFeatures(features);
    map.zoomToExtent(changes.getDataExtent());

    / *
    if (text.match(/<osmChange\s/)) {
        var features = oscFormat.read(text);
    } else {
        console.error("File content not recognized as osmChange (OSC): " + fileName);
    } 
    * /
};
*/

FileReaderControl.prototype.handleFileSelect = function(evt) {
    var files, file;

    evt.stopPropagation();
    evt.preventDefault();

    // FileList from file input or drag'n'drop
    files = evt.target.files || evt.dataTransfer.files;
    if (files.length > 0) {
        file = files[0];
        console.log('handleFileSelect: ' + file.name);
    
        if (file.type === 'application/xml' || file.type === 'text/xml' || !file.type) {
            var fileReader = new FileReader();
            var handleLoad = _.bind(this.onLoadCallback, this);
            fileReader.onload = function(evt) {
                var text = evt.target.result;
                //handleLoad(text, file.name);
                handleLoad(text, file.name);
            };
            fileReader.onerror = function(evt) {
                console.error('Error: ' + evt.target.error.code);
            };
            fileReader.readAsText(file);
        } else {
            console.error("File type '" + file.type + "' not recognized as XML for " + file.name);
        }
    } else if (evt.dataTransfer ) {
        var url = evt.dataTransfer.getData("URL");
        if (url) {
            /*
            var xhr = new XMLHttpRequest();
            url = '/cgi-bin/proxy.cgi?url=' + url;
            xhr.open('GET', url, false);
            xhr.send();
            console.log('status = ' + xhr.status);
            this.onLoadCallback(xhr.responseText, url);
            */
			
            // TODO document why proxy (Overpass: no proxy needed (CORS, but x-requested-with Request patch), used for gzip headers)
            //url = '/cgi-bin/proxy.cgi?url=' + url;
			
            // TODO support multiple, error when URL unknown
			// http://overpass-api.de/augmented_diffs/000/008/066.osc.gz
			//var regex = /http:\/\/overpass-api.de\/augmented_diffs\/([0-9]{3})\/([0-9]{3})\/([0-9]{3}).osc.gz/g;
			// http://overpass-api.de/augmented_diffs/id_sorted/000/028/706.osc.gz
            var regex = /http:\/\/overpass-api.de\/augmented_diffs\/id_sorted\/([0-9]{3})\/([0-9]{3})\/([0-9]{3}).osc.gz/g;
			//var match = myRegexp.exec(myString);
			//alert(match[1]);
			var sequence = parseFloat(url.replace(regex, "$1$2$3"));
			url = 'http://overpass-api.de/api/augmented_diff?id=' + sequence;
			console.log("requesting " + url);
			
            OpenLayers.Request.GET({
                url : url,
                success : function(request) {
                    var response = request.responseXML || request.responseText;
                    if (response) {
                        this.onLoadCallback(response, url);
                    } else {
                        console.error('empty response for "' + url + '" (' + request.status + ' ' + request.statusText + ')');
                    }
                },
                failure: function(request) {
                    console.error('error loading "' + url + '" (' + request.status + ' ' + request.statusText + ')');
                },
                scope: this
            });
        } else {
			console.warn("unhandled event dataTransfer: " + evt.dataTransfer);
		}
    } else {
		console.warn("unhandled event: " + evt);
	}
};

FileReaderControl.prototype.handleDragOver = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
};
