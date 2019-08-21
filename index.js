const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const helpers = require("./helpers");
const app = express();

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
      console.error("other fileBegin error");
      // TODO make this generate a new name and try again on EEXIST
      // this should basically never happen so ¯\_(ツ)_/¯
    }
  }

  // form object
  const form = new formidable.IncomingForm();
  form.uploadDir = tempDirPath;
  form.keepExtensions = true;
  form.multiples = true;

  // parse incoming form data
  form.parse(req, (err, fields, files) => {
    // send everything to a helper function that parses the form and then sends a:w

    require("./parseForm")(err, fields, files, out => {
      if (out.status === 201) {
        // successful, send success message
        res
          .status(out.status)
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
      helpers.returnError(res, 500, "unable to read from tours directory");
      return;
    }

    // filter out files that don't start with the name we're looking for
    files = files.filter(f => f.startsWith(req.params.name));

    // if no files left 404
    if (files.length < 1) {
      helpers.returnError(res, 404, "couldn't find tour " + req.params.name);
      return;
    }

    // return the lexigraphically last filename, it's the most recent
    res.status(200).sendFile(helpers.toursLoc + files.sort()[files.length - 1]);
  });
});

app.listen(3000, () => {
  console.log("Now listening on port 3000...");
});
