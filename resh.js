'use strict';

var http = require('http');
var fs = require('fs');
var urljoin = require('url-join');
var utils = require('./utils');
var formData = require('form-data');

var Commands = function (server, id) {
	this.server = server;
	this.id = id;
};

Commands.prototype.create = function (command, files, options, stream, callback) {
	var THIS = this;
	var form = new formData();

	for (var f in files) {
		var file = files[f];
		form.append(f, fs.createReadStream(file.path));
	}

	form.append('command', command);

	form.submit(urljoin(this.server, '/commands/create'), function (error, res) {
		if (error) {
			throw error;
		}

		res.pipe(stream);
		THIS.id = res.headers['x-id'];

		res.on('end', function () {
			if (callback) {
				callback({
					id: THIS.id
				});
			}
		});
	});
};

Commands.prototype.files = function (callback) {
	var url = urljoin(this.server, 'commands', this.id, 'files');
	http
		.get(url, function (res) {
			var body = '';
			res
				.on('data', function (chunk) {
					body += chunk;
				})
				.on('end', function () {
					if (callback) {
						callback(JSON.parse(body));
					}
				});
		})
		.on('error', function (error) {
			throw error;
		});
};

Commands.prototype.downloadFile = function (path, dest, callback) {
	//TODO: check dest is subfolder
	var url = urljoin(this.server, 'commands', this.id, 'files', path);
	utils.download(url, dest, callback);
};

module.exports = {
	Commands: Commands
};