const AdmZip = require("adm-zip");

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
    } catch (err) {
      if (err) {
        reject({ status: 500, message: "Failed to unzip" });
      }
    }
    // extract all to the directory without overwriting
    // this prevents newer files and the newer metadata from being overwritten
    zip.extractAllToAsync(dir, false, err => {
      if (err) {
        if (err.message === "Failed to unzip: Unable to write") {
          // This is a weird error that I can't duplicate. However, everything
          // still works properly to let's just log it and keep going
          console.error(
            "Got a 'Failed to unzip: Unable to write' error, continuing"
          );
        } else {
          reject({ status: 500, message: "Failed to unzip: " + err.message });
          return;
        }
      }
      resolve();
    });
  });
};

module.exports = extractZip;
