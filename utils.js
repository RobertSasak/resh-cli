'use strict';

var http = require('http');
var fs = require('fs');

function download(url, dest, cb) {
	var file = fs.createWriteStream(dest);

	http.get(url, function (response) {
		response.pipe(file);
		file.on('finish', function () {
			file.close(cb);
		});
	}).on('error', function (error) {
		throw error;
	});
}

module.exports = {
	download: download
};