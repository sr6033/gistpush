const program = require("commander");

const { getVersion } = require("./utils");

let version = "";
(async function() {
  version = await getVersion().catch(console.error);
})();

function main() {
  program
    .version(version)
    .command(
      "push <file1> [file2]",
      "push one or more files to github as a gist",
      { isDefault: true }
    )
    .command(
      "list [username]",
      "list all the public gist of the given user in GitHub. If no username, log in into GitHub instead to get a list of all your public/private gists on GitHub"
    )
    .command("delete <gist_id> [gist_id2...]", "delete one or more gists")
    .parse(process.argv);
}

main();
module.exports = main;
