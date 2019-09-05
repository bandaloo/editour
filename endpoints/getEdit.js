const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");
const admZip = require("adm-zip");

/**
 * Processes a GET request to `/edit/:name`, finding the most recent zip in the
 * `/tours` directory with that name, extracting the metadata, and sending it
 * back to the client.
 *
 * Returns a 200 if successful, a 404 if no tour with that name could be find,
 * or a 500 if the server encounters an error
 * @param {express.Request} req the express request for this GET
 * @param {express.Response} res an express response object
 */
const getEdit = (req, res) => {
  // log this request
  logger.logRequest(req);

  // read files from the tours directory
  pHelpers
    .getTours(constants.toursLoc)
    .then(files => {
      // find the full name of the tour
      return pHelpers.findFileName(files, req.params.name);
    })
    .then(zipFile => {
      logger.log("Sending metadata from " + zipFile);
      const zip = new admZip(constants.toursLoc + zipFile);
      res
        .status(200)
        .contentType("application/json")
        .send(
          JSON.stringify({
            status: 200,
            message: zip.readAsText("metadata.json")
          })
        );
    })
    .catch(errObj => {
      // send errors back to the client
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = getEdit;
