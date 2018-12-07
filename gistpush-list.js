const Gists = require("gists");
const chalk = require("chalk");
const program = require("commander");
const prompt = require("prompt-sync")(); // Sync cli input
const CLI = require("clui");
const Spinner = CLI.Spinner;

const { utils } = require("./utils");

const logError = error => {
  console.log(error);
  console.error(chalk.red(error));
  process.exit(1);
};

const checkAndPrintGists = gists => {
  if (!gists || gists.length === 0) console.log(chalk.green("Nothing to show"));
  else {
    gists.forEach(utils.printGists);
    console.log(chalk.green("Done"));
  }
};

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

const getGists = async ({ credentials, username }) => {
  const areCredentials = credentials && Object.keys(credentials).length > 0;

  const gist = new Gists(areCredentials ? { ...credentials } : undefined);

  const { body } = await gist
    .list(username ? username : undefined)
    .catch(logError);

  return body;
};

program
  .option(
    "-t, --token <token>",
    "Set token to log in into GitHub (use it when you have two-factor auth activated in your GitHub account)"
  )
  .option(
    "--no-login",
    "Do not log in into GitHub. If token provided, this will be ignored. This option only shows public repos"
  )
  .parse(process.argv);

const usernameGists = program.args[0];
const login = program.login;
const secret = program.token ? program.token.trim() : undefined;

if (!login) {
  (async function() {
    const username =
      usernameGists || prompt(chalk.yellow("Username to get gists: "));

    if (!username) logError("Username not provided");

    const spinner = initializeLoader();
    const gists = await getGists({ username }).catch(logError);

    checkAndPrintGists(gists);
    spinner.stop();
    console.log("\n");

    process.exit(0);
  })();
} else if (secret) {
  (async function() {
    console.log(chalk.cyan("Getting Gists..."));

    const spinner = initializeLoader();
    const gists = await getGists({
      credentials: { token: secret },
      username: usernameGists ? usernameGists : undefined
    }).catch(logError);

    checkAndPrintGists(gists);
    spinner.stop();
    console.log("\n");
    process.exit(0);
  })();
} else {
  const fromPropt = prompt(
    chalk.yellow(
      "Username to log in (push enter to use the username argument): "
    )
  );
  const username = fromPropt ? fromPropt : usernameGists;
  if (!username) {
    console.error(chalk.red("Username not provided"));
    process.exit(1);
  }

  const password = prompt.hide(chalk.yellow("Password: "));
  if (!password) {
    console.error(chalk.red("Password or Token not provided"));
    process.exit(1);
  }

  (async function() {
    const spinner = initializeLoader();
    const gists = await getGists({
      credentials: { username, password },
      username: usernameGists ? usernameGists : username
    }).catch(logError);

    checkAndPrintGists(gists);
    spinner.stop();
    process.exit(0);
  })();
}
