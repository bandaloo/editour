const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const Helpers = require("./Helpers");
const app = express();
const admZip = require("adm-zip");
const Logger = require("./Logger");
const pHelpers = require("./pHelpers");

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// initialize the logger and helpers
const logger = new Logger();
const helpers = new Helpers(logger);

// endpoint for file uploads
app.post("/upload", (req, res) => {
  // log this request
  logger.logRequest(req);

  // temporary directory for files to be saved to
  const tempDirPath = helpers.tempLoc + helpers.randName(10) + "/";

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
        helpers.toursLoc,
        tour,
        tempDirPath,
        files,
        metadataString
      );
    })
    .then(() => {
      // send successful response back to the client
      res.status(201).send(
        JSON.stringify({
          status: 201,
          message: "Uploaded under the name '" + tour + "'"
        })
      );
    })
    .catch(errObj => {
      console.error("caught something: " + errObj.message);
      // send errors back to the client
      helpers.returnError(res, errObj.status, errObj.message);
    });
});

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", (req, res) => {
  // log this request
  logger.logRequest(req);

  fs.readdir(helpers.toursLoc, (err, files) => {
    if (err) {
      // send errors back to client
      helpers.returnError(res, 500, "unable to read from tours directory");
      return;
    }

    const filename = helpers.lookupFileName(files, req.params.name);

    // if no files left 404
    if (filename === null) {
      helpers.returnError(res, 404, "couldn't find tour " + req.params.name);
      return;
    }

    logger.log("Sending file: " + filename);
    // return the lexicographically last filename, it's the most recent
    res.status(200).sendFile(helpers.toursLoc + filename);
  });
});

// endpoint to request just the metadata from a tour. Used for editing a tour
app.get("/edit/:name", (req, res) => {
  // log this request
  logger.logRequest(req);

  fs.readdir(helpers.toursLoc, (err, files) => {
    if (err) {
      // send errors back to client
      helpers.returnError(res, 500, "unable to read from tours directory");
      return;
    }

    const filename = helpers.lookupFileName(files, req.params.name);

    if (filename === null) {
      // no file found, send 404
      helpers.returnError(res, 404, "couldn't find tour " + req.params.name);
      return;
    }

    logger.log("Sending file: " + filename);
    // the lexigraphically last filename is the one we want
    const zip = new admZip(helpers.toursLoc + filename);
    res
      .status(200)
      .contentType("application/json")
      .send(
        JSON.stringify({
          status: 200,
          message: zip.readAsText("metadata.json")
        })
      );
  });
});

app.post("/edit", (req, res) => {
  // log this request
  logger.logRequest(req);

  // we're doing a lot of asynchronous calls in a row, so we'll use promises to
  // make it a little cleaner and handle errors better
  const tempDirPath = helpers.tempLoc + helpers.randName(10) + "/";
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
      return pHelpers.getTours(helpers.toursLoc);
    })
    .then(files => {
      // find the full name of the tour
      return pHelpers.findFileName(files, tour);
    })
    .then(zipName => {
      // unzip the old zip into the new temp directory without overwriting files
      return pHelpers.extractZip(helpers.toursLoc + zipName, tempDirPath);
    })
    .then(() => {
      // make sure we have all the files we need
      return pHelpers.verify(tempDirPath, metadataString);
    })
    .then(files => {
      // finally zip the directory back up with the new metadata
      return pHelpers.zipUp(
        helpers.toursLoc,
        tour,
        tempDirPath,
        files,
        metadataString
      );
    })
    .then(() => {
      // send successful response back to the client
      res.status(201).send(
        JSON.stringify({
          status: 201,
          message: "Updated under the name '" + tour + "'"
        })
      );
    })
    .catch(errObj => {
      console.error("caught something: " + errObj.message);
      // send errors back to the client
      helpers.returnError(res, errObj.status, errObj.message);
    });
});

app.listen(3000, () => {
  logger.log("Started listening on port 3000...");
  console.log("Now listening on port 3000...");
});
