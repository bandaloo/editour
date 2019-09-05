const express = require("express");
const logger = require("../logger");
const pHelpers = require("../pHelpers");
const constants = require("../constants");

/**
 * Processes a GET request to `/tours`, reading the `/tours` directory and
 * returning a list of unique tours in it.
 *
 * Returns 200 if successful or 500 if it encounters a server error
 * @param {express.Request} req the express request object for this GET
 * @param {express.Response} res
 */
const getTours = (req, res) => {
  // log this request
  logger.logRequest(req);

  // get the list of all files in the tours directory
  pHelpers
    .getTours(constants.toursLoc)
    .then(files => {
      /** @type string[] */
      let out = [];
      for (const f in files) {
        const l = files[f].length;
        // get only zips
        if (files[f].substring(l - 4) === ".zip") {
          // this works as long as the timestamp was made between 1973 and 5138
          const trimmedName = files[f].substring(0, l - 18);
          // deduplicate
          if (out.indexOf(trimmedName) < 0) {
            out.push(trimmedName);
          }
        }
      }
      // return the list of names to the client
      logger.log("Successfully returning list of filenames");
      res
        .status(200)
        .contentType("application/json")
        .send(
          JSON.stringify({
            status: 200,
            message: JSON.stringify({ files: out })
          })
        );
    })
    .catch(errObj => {
      // send errors back to the client
      constants.returnError(res, errObj.status, errObj.message);
    });
};

module.exports = getTours;
