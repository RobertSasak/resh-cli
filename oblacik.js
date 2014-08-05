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
	var form = new formData();

	for (var f in files) {
		var file = files[f];
		form.append(f, fs.createReadStream(file.path));
	}

	form.append('command', command);

	form.submit({
		port: 3000,
		host: 'localhost',
		path: '/commands/create'
	}, function (error, res) {
		if (error) {
			throw error;
		}

		res.pipe(process.stdout);

		this.id = res.headers['x-id'];

		if (callback) {
			callback({
				id: this.id
			});
		}
	});
};

Commands.prototype.files = function (callback) {
	http.request({
		host: this.server,
		path: urljoin('commands', this.id, 'files')
	}, function (res) {
		var body = '';
		res.on('data', function (chunk) {
			body += chunk;
		}).on('end', function () {
			if (callback) {
				callback(JSON.parse(body));
			}
		});
	}).on('error', function (error) {
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