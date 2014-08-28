'use strict';

var server = 'http://oblacik.sasak.sk/commands/create';

$(function () {
	$('#terminal').terminal(function (command, terminal) {
		if (command === '') {
			return;
		}
		terminal.pause();
		$.get(server, {
			command: command
		}, function (data) {
			terminal.echo(data);
			terminal.resume();
		});
	}, {
		greetings: 'RESH',
		height: 400,
		prompt: '$ '
	});
});