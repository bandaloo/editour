const formidable = require("formidable");
const express = require("express");

/**
 * parses an incoming form, writing its files into a temp directory
 * @param {string} tempDirPath the full path to a temp directory for files
 * @param {express.Request} req an Express Request containing a form submission
 * @param {boolean} isEdit whether this form is an edit request (e.g. if it
 * contains an oldName field)
 * @return {Promise<{tourName: string, metadata: string, oldName?: string}>} a
 * promise with an object containing hte name of the tour and the metadata
 * field
 */
const acceptForm = (tempDirPath, req, isEdit = false) => {
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

      /** @type {{tourName: string, metadata: string, oldName: string}} */
      const out = {
        tourName: undefined,
        metadata: undefined,
        oldName: undefined
      };

      // check for missing or invalid tourName field
      if (typeof fields.tourName !== "string") {
        reject({ status: 400, message: "Missing or invalid tourName field" });
        return;
      } else {
        // format input name so it's URL-friendly
        out.tourName = fields.tourName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[\/\?\=&]/g, "");
      }

      // check for missing or invalid metadata
      if (typeof fields.metadata !== "string") {
        reject({ status: 400, message: "Missing or invalid metadata field" });
        return;
      } else {
        out.metadata = fields.metadata;
      }

      /** @type {string} */
      if (isEdit) {
        // check for missing or invalid oldName field
        if (typeof fields.oldName !== "string") {
          reject({ status: 400, message: "Missing or invalid oldName field" });
          return;
        } else {
          out.oldName = fields.oldName;
        }
      }

      resolve(out);
    });
  });
};

module.exports = acceptForm;
