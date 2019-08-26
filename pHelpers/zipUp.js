const yazl = require("yazl");
const fs = require("fs");

/**
 * Zips up a temp directory into the tours directory, using the tour name and
 * appending a timestamp at the end. This method zips up all files in the
 * filenames parameter. We assume that these files are all present on the
 * disk and have no duplicates, because you should have called verify()
 * before you got here
 * @param {string} toursLoc the full path to the tours directory
 * @param {string} tourName the name of the tour
 * @param {string} tempDir full path of the temp directory with files we need
 * @param {string[]} filenames a list of filenames to zip up
 * @param {string} metadata stringified metadata object
 * @return {Promise<void>} an empty promise
 */
const zipUp = (toursLoc, tourName, tempDir, filenames, metadata) => {
  return new Promise((resolve, reject) => {
    // prepare archive
    const zipName = tourName + "-" + new Date().valueOf() + ".zip";
    const zip = new yazl.ZipFile();

    // add metadata as file
    zip.addBuffer(Buffer.alloc(metadata.length, metadata), "metadata.json");

    // add all files from `filenames`
    try {
      for (const f in filenames) {
        zip.addFile(tempDir + filenames[f], filenames[f]);
      }
      zip.end();
      zip.outputStream.pipe(fs.createWriteStream(toursLoc + zipName));
    } catch (err) {
      reject({ status: 500, message: "Failed creating zip" });
      return;
    }

    // we're done!
    resolve();
  });
};

module.exports = zipUp;
