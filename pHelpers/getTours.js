const fs = require("fs");

/**
 * Reads from the given directory and returns a list of files from it
 * @param {string} toursPath the full path to the tours directory
 * @return {Promise<string[]>} a Promise containing the list of files
 */
const getTours = toursPath => {
  return new Promise((resolve, reject) => {
    fs.readdir(toursPath, (err, files) => {
      if (err) {
        reject({ status: 500, message: "Error reading tours directory" });
        return;
      } else {
        resolve(files);
      }
    });
  });
};

module.exports = getTours;
