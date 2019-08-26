const admZip = require("adm-zip");

/**
 * Extracts a zip to a directory
 * @param {string} zipName the full path to the zip
 * @param {string} dir the full path to the directory
 * @return {Promise<void>} an empty promise ;_;
 */
const extractZip = (zipName, dir) => {
  return new Promise((resolve, reject) => {
    const zip = new admZip(zipName);
    // extract all to the directory without overwriting
    // this prevents newer files and the newer metadata from being overwritten
    zip.extractAllToAsync(dir, false, err => {
      if (err) {
        reject({ status: 500, message: "Failed to unzip" });
        return;
      }
      resolve();
    });
  });
};

module.exports = extractZip;
