// in node

var fs = require('fs'),
	ncp = require('ncp').ncp,
	rimraf = require('rimraf'),
	EasyZip = require('easy-zip').EasyZip,
	zip = new EasyZip(),
	manifest,
	version;

// read manifest file in development directory
fs.readFile('chrome-extension/manifest.json', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	manifest = JSON.parse(data);

	// read version # and modify oauth id for production
	version = manifest['version'];

	// copy development directory
	ncp.limit = 16;
	ncp('chrome-extension', 'chrome-extension-' + version, function (err) {
		if (err) {
			return console.error(err);
		}

	 	// create zipped copy of production version
		zip.zipFolder('chrome-extension-' + version,function(){
			zip.writeToFile('chrome-extension-' + version + '.zip');
		});

		// remove temp directory
		rimraf('chrome-extension-' + version, function(err){
			if (err) {
				return console.log(err);
			};
		});
	});
});