'use strict';

var rest = require('restler');
var fs = require('fs');


function shell(userKey, server, command, files) {
	var data = {};

	if (files) {
		for (var f in files) {
			var file = files[f];

			data[file] = rest.file(file.path, null, fs.statSync(file.path).size);
		}
	}

	rest.post(server + '/' + encodeURIComponent(userKey) + '/' + encodeURIComponent(command), {
		multipart: !!files,
		data: data
	}).on('complete', function (data) {
		console.log(data);
	});
}


module.exports = {
	shell: shell
};