const chalk = require("chalk");
const terminalLink = require("terminal-link");

function printGists(gist, index) {
  const {
    id,
    html_url,
    files,
    public,
    comments,
    created_at,
    updated_at
  } = gist;

  console.group(chalk.white(`id: ${id}`));
  console.group(chalk.yellow("Visit Gist:"));
  console.log(chalk.green(terminalLink(html_url, html_url)));
  console.groupEnd();
  console.group(chalk.yellow("Files:"));
  console.log(chalk.green(Object.keys(files)));
  console.groupEnd();
  console.group(chalk.yellow("Public:"));
  console.log(chalk.green(public));
  console.groupEnd();
  console.group(chalk.yellow("Comments:"));
  console.log(chalk.green(comments));
  console.groupEnd();
  console.group(chalk.yellow("Created At:"));
  console.log(chalk.green(new Date(created_at).toDateString()));
  console.groupEnd();
  console.group(chalk.yellow("Updated At:"));
  console.log(chalk.green(new Date(updated_at).toDateString()));
  console.groupEnd();
  console.groupEnd();
  process.stdout.write("\n");
}

module.exports = { printGists };
