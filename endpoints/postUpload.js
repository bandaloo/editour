const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");

/**
 * Processes a post request to `/upload`. Accepts a valid form containing a
 * tourName field, a metadata field, and any number of files, checks to make
 * sure all the files specified in the metadata are uploaded, then zips the
 * files up with the metadata. This zip is saved in the `/tours` directory
 * along with a timestamp.
 *
 * Sends a 201 to the client if successful, a 400 error if the request is
 * invalid, or a 500 if a server error is encountered
 * @param {express.Request} req the express request for this POST
 * @param {express.Response} res an express response object
 */
const postUpload = (req, res) => {
  // log this request
  logger.logRequest(req);

  // temporary directory for files to be saved to
  const tempDirPath = constants.tempLoc + constants.randName(10) + "/";

  // we're doing a lot of asynchronous calls in a row, so we'll use promises to
  // make it a little cleaner and handle errors better
  let tour, metadataString;

  // first create the temp directory
  pHelpers
    .makeTempDir(tempDirPath)
    .then(() => {
      // write the incoming form into it
      return pHelpers.acceptForm(tempDirPath, req);
    })
    .then(outObj => {
      // save metadata and tour name for later
      tour = outObj.tourName;
      metadataString = outObj.metadata;
      // verify files
      return pHelpers.verify(tempDirPath, outObj.metadata);
    })
    .then(files => {
      // zip up the files in the tours directory
      return pHelpers.zipUp(
        constants.toursLoc,
        tour,
        tempDirPath,
        files,
        metadataString
      );
    })
    .then(() => {
      logger.log("Saved " + tour + ", returning 201 to client");
      // send successful response back to the client
      res
        .status(201)
        .header("Content-type", "application/json")
        .send(
          JSON.stringify({
            status: 201,
            message: "Uploaded under the name '" + tour + "'"
          })
        );
    })
    .catch(errObj => {
      // send errors back to the client
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = postUpload;
