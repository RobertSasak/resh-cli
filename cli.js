#!/usr/bin/env node

'use strict';
var _ = require('lodash');
var multiline = require('multiline');
var nopt = require('nopt');
var updateNotifier = require('update-notifier');
var stdin = require('get-stdin');
var sudoBlock = require('sudo-block');
var notifier = updateNotifier();
var path = require('path');
var oblacik = require('./oblacik.js');
var fs = require('fs');

var options = nopt({
	help: Boolean,
	version: Boolean,
	key: String,
	server: String,
	debug: Boolean
}, {
	h: '--help',
	v: '--version',
	k: '--key',
	s: '--server',
	d: '--debug'
});

var args = options.argv.remain;

function showHelp() {
	console.log(multiline.stripIndent(function () {
		/*
		Execute shell commands remotely.

		If command specify files thore are first uploaded and then the command is executed.

		Usage
		  oblacik <shell command>
		  oblacik [ <shell command>  ] [ <url> <resolution> ]
		  oblacik [ <shell command> ] < <file>
		  cat <file> | oblacik [ <shell command> ... ]

		Example
		  oblacik echo Hello World
		  oblacik < batch.txt
		  cat batch.txt | oblacik

		Options
		  -k, --key <userKey>    Authentification key.
		  -d, --debug            Output what happens under hood.
		  -v, --version
	*/
	}));
}

function detectFiles(args) {
	var files = [];
	_.forEach(args, function (file) {
		var absolutePath = path.resolve(file);
		if (fs.existsSync(file)) {
			console.log(file, absolutePath);

			files[path.basename(file)] = {
				path: absolutePath
			};
		}
	});
	return files;
}

function sendCommand(userKey, server, args) {
	console.log(args);
	var command = args.join(' ');

	var files = detectFiles(args);

	oblacik.shell(userKey, server, command, files);
}

function init(args, options) {
	if (options.version) {
		return console.log(require('./package.json').version);
	}

	if (options.help || args.length === 0) {
		return showHelp();
	}

	var userKey = options.key;
	if (!userKey) {
		return console.log('Missing key. Try command $ oblacik -k 123...xyz echo Hello World');
	}

	options.server = options.server || 'http://54.72.207.64';

	sendCommand(userKey, options.server, args);
}

if (notifier.update) {
	notifier.notify(true);
}

sudoBlock();

if (process.stdin.isTTY) {
	init(args, options);
} else {
	stdin(function (data) {
		[].push.apply(args, data.trim().split('\n'));
		init(args, options);
	});
}