const fs = require("fs");

/**
 * Makes a directory asynchronously, with promises
 * @param {string} dirPath full path of the directory to make
 * @return {Promise<void>} an empty promise
 */
const makeTempDir = dirPath => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, err => {
      if (err) {
        reject({ status: 500, message: "failed to create temp directory" });
      }
      resolve();
    });
  });
};

module.exports = makeTempDir;
