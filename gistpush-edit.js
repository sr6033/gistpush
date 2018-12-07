// FIXME: we can't edit using a token
const Gists = require("gists");
const chalk = require("chalk");
const program = require("commander");
const prompt = require("prompt-sync")(); // Sync cli input
const CLI = require("clui");
const Spinner = CLI.Spinner;
const { fs, utils } = require("./utils");

const initializeLoader = () => {
  const countdown = new Spinner("Fetching gists...  ", [
    "⣾",
    "⣽",
    "⣻",
    "⢿",
    "⡿",
    "⣟",
    "⣯",
    "⣷"
  ]);

  console.log("Fetching... ");
  countdown.start();

  return countdown;
};

const logError = err => {
  console.error(
    chalk.red(err.message === "Not Found" ? "Gist Not Found" : err)
  );
  process.exit(1);
};

const getCredentials = () => {
  const username = prompt(chalk.yellow("Username: "));
  const password = prompt.hide(chalk.yellow("Password: "));

  return { username, password };
};

const createFile = async (filePath, deleteFile) => {
  const fileName = filePath.replace(/(\.\/)?(.+\.[a-zA-Z]+)/, "$2");

  if (deleteFile) {
    return {
      name: fileName,
      deleteFile
    };
  }

  const content = await fs.readFile(filePath).catch(logError);

  return {
    name: fileName,
    content
  };
};

const formatFile = (prev, current) => {
  const { name, content, deleteFile } = current;
  return { ...prev, [name]: deleteFile ? null : { content } };
};

const printSuccess = response => {
  console.clear();
  console.log(chalk.green("Gist updated succesfully!"));
  utils.printGists(response);
  process.exit(0);
};

const editGist = async (
  gistId,
  { credentials, files = [], description = "", deleteFiles = false }
) => {
  const areCredentials = Object.keys(credentials).length > 1;

  const gist = new Gists(areCredentials ? { ...credentials } : undefined);

  console.log(chalk.cyan("\nReading files..."));
  console.log(program.args);

  const loader = initializeLoader();

  const solved = await Promise.all(
    files.map(file => createFile(file, deleteFiles))
  ).catch(logError);

  const formattedFiles = solved.reduce(formatFile, {});

  loader.stop();
  console.log(chalk.green("\nDone..."));
  console.clear();
  console.log(chalk.cyan("\nSending files...\n"));
  loader.start();

  const { body } = await gist
    .edit(gistId, {
      description,
      files: formattedFiles
    })
    .catch(logError);

  loader.stop();
  console.log(chalk.green("\nDone...\n"));
  return body;
};

program
  .description(
    "update one or more files in a gist related to the account logged in"
  )
  .arguments("<filespath...>")
  .option("-g, --gist-id <gist_id>", "identifier of Gist to edit")
  .option(
    "-t, --token <token>",
    "Set token to log in into GitHub (recommended if you have two-factor auth activated in your GitHub account)"
  )
  .option(
    "-d, --set-description <description>",
    "new description to be saved in the gist"
  )
  .option(
    "-D, --delete-files",
    "Use the given paths in the arguments to eliminate files in the Gist"
  )
  .parse(process.argv);

const files = program.args;
const gistID = program.gistId;
const description = program.setDescription;
const deleteFiles = program.deleteFiles;
const token = program.token;

if (!gistID) {
  logError(new Error("Gist ID not provided"));
}

if (!files || files.length === 0) {
  console.log(chalk.orange("The Gist will be update without modfied files"));
}

(async function() {
  if (token) {
    const credentials = { token };

    const gist = await editGist(gistID, {
      credentials,
      files,
      description,
      deleteFiles
    });

    printSuccess(gist);
  } else {
    const credentials = getCredentials();

    const gist = await editGist(gistID, {
      credentials,
      files,
      description,
      deleteFiles
    });

    printSuccess(gist);
  }
})();
