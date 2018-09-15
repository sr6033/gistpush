#!/usr/bin/env node --harmony
const Gists = require('gists');
const fs = require('fs');
const ProgressBar = require('progress');
const chalk = require('chalk');
const request = require('superagent');
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const terminalLink = require('terminal-link');

program
	.arguments('<file>')
	.option('-u, --username <username>', 'The user to authenticate as')
	.option('-p, --password <password>', 'The user\'s password')
	.option('-d, --description <description>', 'Description of the file')
	.option('-a, --access <access>', 'Public(t)/Private(f) access for the file. Default is true.')
	.action(function(file) {
		co(function *() {
			var username = yield prompt(chalk.yellow('username: '));
			var password = yield prompt.password(chalk.yellow('password: '));
			var description = yield prompt(chalk.yellow('description: '));
			var access = yield prompt(chalk.yellow('access [Public(t)/Private(f)]: '));
			
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
					const link = terminalLink('Link: ' + res.body.html_url, res.body.html_url);
					console.log(chalk.cyan('\nGist added successfully.'));
					console.log(chalk.green(link + '\n'));
					process.exit(0);
				}
			})
  			.catch(function(err) {
  				console.log(chalk.red(err));
  				process.exit(1);
  			});		
		});
	})
	.parse(process.argv);