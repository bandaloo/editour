const fs = require("fs");
const formidable = require("formidable");
const express = require("express");
const yazl = require("yazl");
const admZip = require("adm-zip");

/**
 * Lots of helpers that return promises
 */
const pHelpers = {
  /**
   * parses an incoming form, writing its files into a temp directory
   * @param {string} tempDirPath the full path to a temp directory for files
   * @param {express.Request} req an Express Request containing a form submission
   * @return {Promise<{tourName: string, metadata: string}>} a promise with an
   * object containing hte name of the tour and the metadata field
   */
  acceptForm: (tempDirPath, req) => {
    return new Promise((resolve, reject) => {
      // create form object
      const form = new formidable.IncomingForm();
      form.uploadDir = tempDirPath;
      form.keepExtensions = true;
      form.multiples = true;

      form.on(
        "fileBegin",
        /**
         * @param {string} name the name of the HTMl input
         * @param {formidable.File} file the file that is beginning
         */
        (name, file) => {
          if (file.name.length > 0) {
            // write the files with the correct file name from the client
            file.path = tempDirPath + file.name;
          } else {
            // TODO find a better way to get rid of empty files
            file.path = "/dev/null";
          }
        }
      );

      form.parse(req, (err, fields, files) => {
        // send errors back to client
        if (err) {
          reject({ status: 400, message: "Error parsing form" });
          return;
        }

        // check for missing or invalid tourName field
        if (typeof fields.tourName !== "string") {
          reject({ status: 400, message: "Missing or invalid tourName field" });
          return;
        }

        // check for missing or invalid metadata
        if (typeof fields.metadata !== "string") {
          reject({ status: 400, message: "Missing or invalid metadata field" });
          return;
        }

        // format input name to it's URL-friendly
        const tourName = fields.tourName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[\/\?\=&]/g, "");
        resolve({ tourName: tourName, metadata: fields.metadata });
      });
    });
  },

  /**
   * writes input metadata string to a file called `metadata.json` in the directory provided
   * @param {string} metadata metadata object as a string
   * @param {string} tempDirPath full path to the temp directory
   * @return {Promise<void>} an empty promise ;_;
   */
  writeMetadata: (metadata, tempDirPath) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(tempDirPath + "metadata.json", metadata, err => {
        if (err) {
          reject({ status: 500, message: "Failed to write metadata.json" });
          return;
        }
        resolve();
      });
    });
  },

  /**
   * Reads from the given directory and returns a list of files from it
   * @param {string} toursPath the full path to the tours directory
   * @return {Promise<string[]>} a Promise containing the list of files
   */
  getTours: toursPath => {
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
  },

  /**
   * finds and returns the most recent zip file with the given name in the
   * among the given filenames
   * @param {string[]} files list of filenames
   * @param {string} name the name of the tour we're searching for
   * @return {Promise<string>} a Promise containing the correct name of the
   * most recent tour zip
   */
  findFileName: (files, name) => {
    return new Promise((resolve, reject) => {
      if (typeof files === "undefined") {
        console.error("ASLKFJALKDSFJ");
        reject({
          status: 404,
          message: "No files found"
        });
      }

      // filter out files that aren't the name we're looking for
      // this regex works as long as the timestamp was made between 1973 and 5138
      files = files.filter(f =>
        new RegExp("^" + name + "-[0-9]{12,13}\\.zip$").test(f)
      );

      // if none left, throw an error because the filename we're looking for
      // doesn't exist
      if (files.length < 1) {
        reject({
          status: 404,
          message: "Couldn't find tour with name " + name
        });
      }

      // return the lexigraphically last matching filename, that's the most recent
      resolve(files.sort()[files.length - 1]);
    });
  },

  /**
   * Makes a directory asynchronously, with promises
   * @param {string} dirPath full path of the directory to make
   * @return {Promise<void>} an empty promise
   */
  makeTempDir: dirPath => {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirPath, { recursive: true }, err => {
        if (err) {
          reject({ status: 500, message: "failed to create temp directory" });
        }
        resolve();
      });
    });
  },

  /**
   * Extracts a zip to a directory
   * @param {string} zipName the full path to the zip
   * @param {string} dir the full path to the directory
   * @return {Promise<void>} an empty promise ;_;
   */
  extractZip: (zipName, dir) => {
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
  },

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
  zipUp: (toursLoc, tourName, tempDir, filenames, metadata) => {
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
  },

  /**
   * Checks to make sure all the files in metadata are present in the temp
   * directory and that there are no duplicate files listed in metadata.
   * @param {string} tempDirPath full path to the temp directory
   * @param {string} metadata stringified metadata object
   * @return {Promise<string[]>} an empty promise
   */
  verify: (tempDirPath, metadata) => {
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
  }
};

module.exports = pHelpers;
