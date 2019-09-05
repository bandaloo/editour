const acceptForm = require("./pHelpers/acceptForm");
const getTours = require("./pHelpers/getTours");
const findFileName = require("./pHelpers/findFileName");
const makeTempDir = require("./pHelpers/makeTempDir");
const extractZip = require("./pHelpers/extractZip");
const zipUp = require("./pHelpers/zipUp");
const verify = require("./pHelpers/verify");
const removeTour = require("./pHelpers/removeTour");

/**
 * Lots of helpers that return promises
 */
const pHelpers = {
  acceptForm,
  getTours,
  findFileName,
  makeTempDir,
  extractZip,
  zipUp,
  verify,
  removeTour
};

module.exports = pHelpers;
