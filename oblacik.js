'use strict';

var fs = require('fs');
var FormData = require('form-data');

function shell(userKey, server, command, files) {
	var form = new FormData();

	for (var f in files) {
		var file = files[f];
		form.append(f, fs.createReadStream(file.path));
	}

	form.submit(server + '/' + encodeURIComponent(userKey) + '/' + encodeURIComponent(command), function (err, res) {
		if (err) {
			throw err;
		} else {
			res.pipe(process.stdout);
		}
	});
}


module.exports = {
	shell: shell
};