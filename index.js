const express = require("express");
const app = express();
const admZip = require("adm-zip");
const logger = require("./logger");
const pHelpers = require("./pHelpers");
const returnError = require("./returnError");
const constants = require("./constants");
const randName = require("./randName");

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// get port from environment variable, or use 3000 as the default
const port = process.env.NODE_PORT || 3000;

// endpoint for file uploads
app.post("/upload", (req, res) => {
  // log this request
  logger.logRequest(req);

  // temporary directory for files to be saved to
  const tempDirPath = constants.tempLoc + randName(10) + "/";

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
      returnError(res, errObj.status, errObj.message);
    });
});

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", (req, res) => {
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
      returnError(res, errObj.status, errObj.message);
    });
});

// endpoint to request just the metadata from a tour. Used for editing a tour
app.get("/edit/:name", (req, res) => {
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
      returnError(res, errObj.status, errObj.message);
    });
});

app.post("/edit", (req, res) => {
  // log this request
  logger.logRequest(req);

  // we're doing a lot of asynchronous calls in a row, so we'll use promises to
  // make it a little cleaner and handle errors better
  const tempDirPath = constants.tempLoc + randName(10) + "/";
  /** @type {string} */
  let tour;
  /** @type {string} */
  let metadataString;

  // first create the temp directory
  pHelpers
    .makeTempDir(tempDirPath)
    .then(() => {
      // write the incoming form into it
      return pHelpers.acceptForm(tempDirPath, req);
    })
    .then(outObj => {
      // save tourName and metadata for later
      tour = outObj.tourName;
      metadataString = outObj.metadata;
      // search for the right zip in the tours directory
      return pHelpers.getTours(constants.toursLoc);
    })
    .then(files => {
      // find the full name of the tour
      logger.log("Looking up zip name " + tour + "...");
      return pHelpers.findFileName(files, tour);
    })
    .then(zipName => {
      // unzip the old zip into the new temp directory without overwriting files
      logger.log("Extracting old " + zipName + " to " + tempDirPath + " ...");
      return pHelpers.extractZip(constants.toursLoc + zipName, tempDirPath);
    })
    .then(() => {
      // make sure we have all the files we need
      logger.log("Verifying " + tour + "...");
      return pHelpers.verify(tempDirPath, metadataString);
    })
    .then(files => {
      // finally zip the directory back up with the new metadata
      logger.log("Zipping up " + tour + "...");
      return pHelpers.zipUp(
        constants.toursLoc,
        tour,
        tempDirPath,
        files,
        metadataString
      );
    })
    .then(() => {
      logger.log(tour + " successfully edited");
      // send successful response back to the client
      res
        .status(201)
        .header("Content-type", "application/json")
        .send(
          JSON.stringify({
            status: 201,
            message: "Updated under the name '" + tour + "'"
          })
        );
    })
    .catch(errObj => {
      // send errors back to the client
      returnError(res, errObj.status, errObj.message);
    });
});

app.listen(port, () => {
  logger.log("Started listening on port " + port + "...");
});
