const fs = require("fs");
const constants = require("../constants");

/**
 * Removes all files in the input filename list that are versions of the tour
 * with the given name
 * @param {string[]} files list of filenames to look through
 * @param {string} name name of the tour to delete
 * @return {Promise<number>} a promise containing the number of files deleted
 */
const removeTour = (files, name) => {
  return new Promise((resolve, reject) => {
    let count = 0; // number of files deleted
    for (const f of files) {
      const l = f.length;
      // get only zips
      if (f.substring(l - 4) === ".zip") {
        // this works as long as the timestamp was made between 1973 and 5138
        const trimmedName = f.substring(0, l - 18);
        // if the trimmed name is equal to the input name delete it
        if (trimmedName === name) {
          try {
            // it's probably more efficient to do this async, but it makes
            // control flow a lot more complicated
            fs.unlinkSync(constants.toursLoc + f)
          } catch (err) {
            if (err) {
              reject({
                status: 500,
                message: `Failed to delete file ${f}: ${err.message}`
              });
            }
          }
          count++;
        }
      }
    }
    if (count === 0) {
      reject({
        status: 404,
        message: "Couldn't find tour " + name
      });
    } else {
      resolve(count);
    }
  });
};

module.exports = removeTour;
