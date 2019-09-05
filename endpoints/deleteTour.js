const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");

/**
 * Processes a DELETE request to `/tour/:name`, deleting all tour zips with the
 * given name from the server.
 *
 * Returns 200 if successful, 404 if no tour with that name could be found, or
 * 500 if it encounters a server error
 * @param {express.Request} req the express request for this DELETE
 * @param {express.Response} res an express response object
 */
const deleteTour = (req, res) => {
  // log this request
  logger.logRequest(req);

  // get a list of files in the toursLoc
  pHelpers
    .getTours(constants.toursLoc)
    .then(files => {
      // remove matching files from the filesystem
      return pHelpers.removeTour(files, req.params.name);
    })
    .then(count => {
      logger.log("Deleted " + count + " versions of " + req.params.name);
      res
        .status(200)
        .contentType("application/json")
        .send(JSON.stringify({
          status: 200,
          message: `Successfully deleted ${count} versions of ${req.params.name}`
        }));
    })
    .catch(errObj => {
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = deleteTour;
