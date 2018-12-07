#!/usr/bin/env node

(async function() {
  const program = require("commander");

  const { getVersion } = require("./utils");

  const version = await getVersion().catch(console.error);

  function main() {
    program
      .version(version)
      .command(
        "push <file1> [file2]",
        "push one or more files to github as a gist",
        { isDefault: true }
      )
      .command("list [username]", "list all gists for the given user")
      .command("delete <gist_id...>", "delete one or more gists")
      .command("edit <filespath...>", "update one or more files in a gist")
      .parse(process.argv);
  }

  main();
  module.exports = main;
})();
