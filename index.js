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
    .command("list", "list all the gists in a github profile")
		.command("delete <gist_id> [gist_id2...]", "delete one or more gists")
    .parse(process.argv);
}

main();
module.exports = main;
