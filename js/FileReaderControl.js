/**
 * Reads files using HTML5 file API
 *  
 * derived from http://www.html5rocks.com/en/tutorials/file/dndfiles/
 */
function FileReaderControl(onLoadCallback) {
    this.onLoadCallback = onLoadCallback;
    
    // {urlRegex:, handler:} objects
    this.urlHandlers = [];
}

FileReaderControl.prototype.addUrlHandler = function(urlRegex, handler) {
    this.urlHandlers.push({urlRegex: urlRegex, handler: handler});
};

FileReaderControl.prototype.activate = function() {
    if (window.File && window.FileReader && window.FileList) {
        document.getElementById('fileinput').addEventListener('change', _.bind(this.handleFileSelect, this), false);

        var dropZone = document.getElementById('map_div'); 
        dropZone.addEventListener('dragover', this.handleDragOver, false);
        dropZone.addEventListener('drop', _.bind(this.handleFileSelect, this), false);
    } else {
        // File API not supported
        document.getElementById('fileinput').disabled = true;
        console.warn('Browser does not support the HTML5 File API!');
    }    
};

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
            var handled = false;
            for (var i = 0; i < this.urlHandlers.length; i++) {
                var obj = this.urlHandlers[i];
                if (obj.urlRegex.test(url)) {
                    obj.handler(url);
                    handled = true;
                    break;
                }
            }
            if (!handled) {
                console.warn("no handler found for url: " + url);
            }
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
