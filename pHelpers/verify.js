const fs = require("fs");

/**
 * Checks to make sure all the files in metadata are present in the temp
 * directory and that there are no duplicate files listed in metadata.
 * @param {string} tempDirPath full path to the temp directory
 * @param {string} metadata stringified metadata object
 * @return {Promise<string[]>} an empty promise
 */
const verify = (tempDirPath, metadata) => {
  return new Promise((resolve, reject) => {
    // parse metadata string
    let data;
    try {
      data = JSON.parse(metadata);
    } catch (e) {
      reject({ status: 400, message: "Invalid metadata string" });
      return;
    }
    // filenames are stored in nested array in `data`, so lets flatten them
    /** @type string[] */
    const filenames = [].concat
      .apply(
        [],
        data["regions"].map(
          x => x["audio"].concat(x["images"])
          // TODO ^ if more file fields are added they should be added here
        )
      )
      .sort();
    const x = 2;

    // we're doing this synchronously because it would be super complicated to
    // do it async and I don't care that much about the marginal performance
    // benefit
    const fsFiles = fs.readdirSync(tempDirPath);
    // walk through filenames, verifying that they are all present in the temp
    // directory and that there are no duplicates
    for (let i = 0; i < filenames.length; ++i) {
      if (i < filenames.length - 1 && filenames[i] === filenames[i + 1]) {
        reject({ status: 400, message: "Duplicate files in metadata" });
        return;
      }
      if (fsFiles.indexOf(filenames[i]) < 0) {
        reject({
          status: 400,
          message: "File " + filenames[i] + " in metadata not present on disk"
        });
        return;
      }
    }
    // if we make it here it means everything succeeded, so resolve
    resolve(filenames);
  });
};

module.exports = verify;
