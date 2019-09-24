const AdmZip = require("adm-zip");
const logger = require("../logger");

/**
 * Extracts a zip to a directory
 * @param {string} zipName the full path to the zip
 * @param {string} dir the full path to the directory
 * @return {Promise<void>} an empty promise ;_;
 */
const extractZip = (zipName, dir) => {
  return new Promise((resolve, reject) => {
    let zip;
    try {
      zip = new AdmZip(zipName);
      // extract all to the directory without overwriting
      // this prevents newer files and the newer metadata from being overwritten
      // this was originally done async, but the async version of this library
      // function is incredibly buggy
      zip.extractAllTo(dir, false)
    } catch (err) {
      if (err) {
        reject({ status: 500, message: "Failed to unzip" });
      }
    }
    resolve();
  });
};

module.exports = extractZip;
