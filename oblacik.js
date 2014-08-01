'use strict';

var fs = require('fs');
var FormData = require('form-data');
var _ = require('lodash');
var http = require('http');
var fs = require('fs');
var urljoin = require('url-join');

function download(url, dest, cb) {
	//TODO: check dest is subfolder
	var file = fs.createWriteStream(dest);

	http.get(url, function (response) {
		response.pipe(file);
		file.on('finish', function () {
			file.close(cb);
		});
	});
}

function downloadFiles(fileUrl) {
	http.get(fileUrl, function (res) {
		var body = '';

		res.on('data', function (chunk) {
			body += chunk;
		}).on('end', function () {
			var files = JSON.parse(body);
			_.forEach(files, function (f) {
				download(urljoin(fileUrl, f.path), f.path);
			});
		});
	}).on('error', function (error) {
		throw error;
	});
}

function shell(userKey, server, command, files) {
	var form = new FormData();

	for (var f in files) {
		var file = files[f];
		form.append(f, fs.createReadStream(file.path));
	}

	var url = urljoin(server, encodeURIComponent(userKey), encodeURIComponent(command));

	form.submit(url, function (err, res) {
		if (err) {
			throw err;
		}

		var filesUrl = res.headers['x-files-url'];

		if (filesUrl) {
			downloadFiles(server + '/' + filesUrl);
		}

		res.pipe(process.stdout);
	});
}


module.exports = {
	shell: shell
};