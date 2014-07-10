'use strict';

var rest = require('restler');
var fs = require('fs');


function shell(userKey, server, command, files) {
	var options = {},
		data = {},
		hasFiles = false;

	for (var f in files) {
		var file = files[f];

		data[file] = rest.file(file.path, null, fs.statSync(file.path).size);
		hasFiles = true;
	}
	if (hasFiles) {
		options.multipart = true;
		options.data = data;
	}

	rest.post(server + '/' + encodeURIComponent(userKey) + '/' + encodeURIComponent(command), options).on('complete', function (data) {
		console.log(data);
	});
}


module.exports = {
	shell: shell
};