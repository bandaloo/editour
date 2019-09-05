const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");

/**
 * Handles GET requests to `/tour/:name`. Looks up the most recent version of a
 * tour with the given name in the `/tours` directory and serves it to the client
 *
 * Returns a 200 if the tour is found, a 404 if a tour with that name can't be
 * found, or a 500 if the server encounters an error
 * @param {express.Request} req the express request for this GET
 * @param {express.Response} res an express response object
 */
const getTour = (req, res) => {
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
      logger.log("Sending file: " + zipFile);
      res
        .status(200)
        .download(
          constants.toursLoc + zipFile,
          req.params.name + ".zip",
          err => {
            if (err) {
              throw err;
            }
          }
        );
    })
    .catch(errObj => {
      // send errors back to the client
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = getTour;
