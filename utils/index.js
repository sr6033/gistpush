const fs = require("./fs_as_promise");

const getVersion = async () => {
  const json = await fs.readFile("package.json").catch(console.error);
  const { version } = JSON.parse(json);

  return version;
};

module.exports = {
  getVersion,
  fs
};
