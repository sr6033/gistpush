const chalk = require('chalk');

function exit(check_end, links, fileList) {
	if(check_end == true)
	{
		console.log(chalk.cyan('\nGist(s) added successfully.'));
		var index = 0;
		for(val of links)
			console.log(chalk.green(fileList[index++] + ': ' + val + '\n'));
		process.exit(0);
	}
}

module.exports = exit;