#!/usr/bin/env node
const Gists = require('gists');
const fs = require('fs');
//const ProgressBar = require('progress');
const chalk = require('chalk');
const request = require('superagent');
const co = require('co');
//const prompt = require('co-prompt');
const program = require('commander');
const terminalLink = require('terminal-link');
const exit = require('./success.js');
const prompt = require('prompt-sync')();  // Sync cli input
var CLI = require('clui'),
    Spinner = CLI.Spinner;

var username = '', password = '', details = [], privacy = [],
	upload_complete = false;
/*
// Using promise (async)
function input_data(fileList) {
	return new Promise(function(resolve, reject) {
    	// Do async job
    	co(function *() {
			username = yield prompt(chalk.yellow('username: '));
			password = yield prompt.password(chalk.yellow('password: '));

			for(file of fileList)
			{
				console.log('for file: ' + chalk.cyan(file));
				var detail_text = yield prompt(chalk.yellow('description: '));
				var privacy_value = yield prompt(chalk.yellow('access [Public(t)/Private(f)]: '));
				details.push(detail_text);
				privacy.push(privacy_value);		
			}
		});
        resolve(true);
    })
}
*/

// Using sync command line input
function input_data(fileList) {
	username = prompt(chalk.yellow('username: '));
	password = prompt.hide(chalk.yellow('password: '));

	for(file of fileList)
	{
		console.log('for file: ' + chalk.cyan(file));
		var detail_text = prompt(chalk.yellow('description: '));
		var privacy_value = prompt(chalk.yellow('access [Public(t)/Private(f)]: '));
		details.push(detail_text);
		privacy.push(privacy_value);
	}

	return true;
}

function loading() {
	var countdown = new Spinner('Uploading...  ', ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);

	console.log('Uploading... ');
	countdown.start()

	// var number = 10;
	setInterval(function () {
		// number--;
		// countdown.message('Uploading... ');

		if (upload_complete) {
			countdown.stop();
			process.stdout.write('\n');
			process.exit(0);
		}
	}, 1000);
}

function main() {
	program
	.arguments('<file1> [file2]')
	.option('-u, --username <username>', 'The user to authenticate as')
	.option('-p, --password <password>', 'The user\'s password')
	.option('-d, --description <description>', 'Description of the file')
	.option('-a, --access <access>', 'Public(t)/Private(f) access for the file. Default is true.')
	//.option('-c, --collect [value]', 'A repeatable value', collect, [])
	//.option('-f, --multipleFiles <multipleFiles>', 't: multiple files | default: single file')

	.action(function() {
		//console.log(' collect: %j', program.collect);

		var count_upload = 0;
		
		co(function *() {
			//console.log(program.args);
			var fileList = [], links = [];
			fileList = program.args[2]['rawArgs'].filter( function(val, index) {
				if(index > 1)
					return true;
			});

			// Taking inputs
			var success = false;
			success = input_data(fileList);

			// After sync input is complete
			if(success == true)
			{
				loading();  // Loading animation

				var fileNumber = 0;
				for(var file of fileList)
				{
					var description = details[fileNumber];
					var access = privacy[fileNumber];
					
					if(access == 't' || access == 'true')
						access = true;
					else 
						if(access == 'f' || access == 'false')
							access = false;
					else
						access = true;

					const gists = new Gists({
					  username: username, 
					  password: password
					});

					var fileData = fs.readFileSync(file, 'utf8');

					++fileNumber;
					
					gists.create(
						{
							"description": description,
						  	"public": access,
						  	"files": {
						  		[file]: {
						  			"content": fileData
						  		}
						  	}
						}
					)
					.then(function(res, err) {
						if(res)
						{
							const url = terminalLink(res.body.html_url, res.body.html_url);
							links.push(url);
							++count_upload;
							
							// Checking end of all file uploads
							if(count_upload == fileList.length)
							{
								upload_complete = true;
								exit(true, links, fileList);
							}
						}
					})
		  			.catch(function(err) {
		  				console.log(chalk.red(err));
		  				process.exit(1);
		  			});

				} // end for
			} // end if
			

		});
	})
	.parse(process.argv);

}


main();
module.exports = main;
