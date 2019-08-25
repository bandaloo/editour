const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const helpers = require("./helpers");
const app = express();
const admZip = require("adm-zip");

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// endpoint for file uploads
app.post("/upload", (req, res) => {
  // temporary directory for files to be saved to
  const tempDirPath = helpers.tempLoc + helpers.randName(10) + "/";
  // create directory
  try {
    fs.mkdirSync(tempDirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      helpers.returnError(res, 500, "server failed to create temp directory");
      return;
    } else {
      console.error("EEXIST error");
      // TODO make this generate a new name and try again on EEXIST
      // I think it should still work as long as two requests don't generate the
      // same name while one of them is still writing, which is astronomically
      // unlikely. The new files should just overwrite the old ones in the temp
      // directory, which shouldn't matter ¯\_(ツ)_/¯
    }
  }

  // form object
  const form = new formidable.IncomingForm();
  form.uploadDir = tempDirPath;
  form.keepExtensions = true;
  form.multiples = true;

  // parse incoming form data
  form.parse(req, (err, fields, files) => {
    // send everything to a helper function that parses the form and sends a
    // status/message to the callback
    require("./parseForm")(err, fields, files, out => {
      if (out.status === 201) {
        // successful, send success message
        res
          .status(out.status)
          .contentType("application/json")
          .send(JSON.stringify({ status: out.status, message: out.message }));
      } else {
        // something went wrong, send error
        helpers.returnError(res, out.status, out.message);
      }
    });
  });
});

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", (req, res) => {
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

    // return the lexicographically last filename, it's the most recent
    res.status(200).sendFile(helpers.toursLoc + filename);
  });
});

// endpoint to request just the metadata from a tour. Used for editing a tour
app.get("/edit/:name", (req, res) => {
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

app.listen(3000, () => {
  console.log("Now listening on port 3000...");
});
