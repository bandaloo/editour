const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");

/**
 * Processes a POST request to `/edit/:name`, which should include a tourName
 * field, oldName field, and metadata field along with any number of files. It
 * unzips the old tour into a temp directory, writes the new files into the
 * same temp directory, and then verifies that all the files in the new
 * metadata are present. It then zips up the new tour metadata dn files into a
 * new zip file with the tourName and timestamp.
 *
 * Returns a 201 if the tour was edited successfully, a 400 if the request was
 * invalid, a 404 if the old tour couldn't be found, or a 500 if a server error
 * occurred while processing this request.
 * @param {express.Request} req the express request for this POST
 * @param {express.Response} res an express response object
 */
const postEdit = (req, res) => {
  // log this request
  logger.logRequest(req);

  // we're doing a lot of asynchronous calls in a row, so we'll use promises to
  // make it a little cleaner and handle errors better
  const tempDirPath = constants.tempLoc + constants.randName(10) + "/";
  /** @type {string} */
  let tourName;
  /** @type {string} */
  let oldName;
  /** @type {string} */
  let metadataString;

  // first create the temp directory
  pHelpers
    .makeTempDir(tempDirPath)
    .then(() => {
      // write the incoming form into it
      return pHelpers.acceptForm(tempDirPath, req, true);
    })
    .then(outObj => {
      // save tourName and metadata for later
      tourName = outObj.tourName;
      oldName = outObj.oldName;
      metadataString = outObj.metadata;
      // search for the right zip in the tours directory
      return pHelpers.getTours(constants.toursLoc);
    })
    .then(files => {
      // find the full name of the tour
      logger.log("Looking up zip name " + oldName + "...");
      return pHelpers.findFileName(files, oldName);
    })
    .then(zipName => {
      // unzip the old zip into the new temp directory without overwriting files
      logger.log("Extracting old " + zipName + " to " + tempDirPath + " ...");
      return pHelpers.extractZip(constants.toursLoc + zipName, tempDirPath);
    })
    .then(() => {
      // make sure we have all the files we need
      logger.log("Verifying " + tourName + "...");
      return pHelpers.verify(tempDirPath, metadataString);
    })
    .then(files => {
      // finally zip the directory back up with the new metadata
      logger.log("Zipping up " + tourName + "...");
      return pHelpers.zipUp(constants.toursLoc, tourName, tempDirPath, files);
    })
    .then(() => {
      logger.log(oldName + " successfully edited and saved as " + tourName);
      // send successful response back to the client
      res
        .status(201)
        .header("Content-type", "application/json")
        .send(
          JSON.stringify({
            status: 201,
            message: "Updated under the name '" + tourName + "'"
          })
        );
    })
    .catch(errObj => {
      // send errors back to the client
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = postEdit;
