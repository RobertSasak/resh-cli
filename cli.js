#!/usr/bin/env node

'use strict';
var _ = require('lodash');
var multiline = require('multiline');
var updateNotifier = require('update-notifier');
var stdin = require('get-stdin');
var sudoBlock = require('sudo-block');
var notifier = updateNotifier();
var path = require('path');
var oblacik = require('./oblacik.js');
var fs = require('fs');
var Configstore = require('configstore');
var packageName = require('./package').name;
var slash = require('slash');

function parseArgs(args) {
	var options = {},
		i = 0;
	while (i < args.length) {
		var arg = args[i];
		switch (arg) {
		case '-v':
		case '--version':
			options.version = true;
			break;
		case '-h':
		case '--help':
			options.help = true;
			break;
		case '-s':
		case '--server':
			options.server = args[i + 1];
			i++;
			break;
		case '-k':
		case '--key':
			options.key = args[i + 1];
			i++;
			break;
		default:
			if (arg[0] === '-') {
				console.log('Invalid option: ' + arg);
			} else {
				return {
					options: options,
					command: args.splice(i)
				};
			}
		}
		i++;
	}
	return {
		options: options,
		command: []
	};
}

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

		Once the key is provided the key is cached and can be omit in next commands.	
	*/
	}));
}

function detectFiles(args) {
	var files = [];
	_.forEach(args, function (file) {
		var absolutePath = path.resolve(file);
		try {
			var stat = fs.lstatSync(absolutePath);
			if (stat.isFile()) {
				var relativePath = path.relative(__dirname, absolutePath);
				if (process.platform === 'win32') {
					relativePath = slash(relativePath);
				}
				if (relativePath.indexOf('..') !== 0) {
					files[relativePath] = {
						path: absolutePath
					};
				}
			}
		} catch (e) {}
	});
	return files;
}

function sendCommand(userKey, server, args) {
	var command = args.join(' ');

	var files = detectFiles(args);

	oblacik.shell(userKey, server, command, files);
}

function init(args, options) {
	var conf = new Configstore(packageName);

	if (options.version && args.length === 0) {
		return console.log(require('./package.json').version);
	}

	if ((options.help && args.length === 0) || args.length === 0) {
		return showHelp();
	}

	options.key = options.key || conf.get('key');
	if (!options.key) {
		return console.log('Missing key. Try command $ oblacik -k 123...xyz echo Hello World');
	}

	options.server = options.server || conf.get('server') || 'http://54.72.207.64';

	conf.set('key', options.key);
	conf.set('server', options.server);

	sendCommand(options.key, options.server, args);
}

function main() {
	var args = _.rest(process.argv, 2);
	var options = {};
	var parsed = parseArgs(args);

	if (notifier.update) {
		notifier.notify(true);
	}

	sudoBlock();

	if (process.stdin.isTTY) {
		init(parsed.command, parsed.options);
	} else {
		stdin(function (data) {
			[].push.apply(args, data.trim().split('\n'));
			init(args, options);
		});
	}
}

main();