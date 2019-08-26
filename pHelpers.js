const acceptForm = require("./pHelpers/acceptForm");
const getTours = require("./pHelpers/getTours");
const findFileName = require("./pHelpers/findFileName");
const makeTempDir = require("./pHelpers/makeTempDir");
const extractZip = require("./pHelpers/extractZip");
const zipUp = require("./pHelpers/zipUp");
const verify = require("./pHelpers/verify");

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
  verify
};

module.exports = pHelpers;
