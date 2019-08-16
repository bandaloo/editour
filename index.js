const express = require("express");
const formidable = require("formidable");
const archiver = require("archiver");
const fs = require("fs");
const app = express();

const toursLoc = __dirname + "/tours/"; // TODO maybe change this?
const tempLoc = __dirname + "/temp/"; // TODO maybe change this?

// static directory
app.use(express.static(__dirname + "/static"));

// endpoint for file uploads
app.post("/upload", (req, res) => {
  // temporary directory for files to be saved to
  const tempDirPath = tempLoc + randName(10) + "/";
  // create directory
  try {
    fs.mkdirSync(tempDirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      returnError(res, 500, "server failed to create temp directory");
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

  form.parse(req, (err, fields, files) => {
    if (err) {
      returnError(res, 400, "error parsing form");
      return;
    }
    console.log("parsing request form...");

    // check for missing or invalid 'name' field from client
    if (typeof fields.name !== "string") {
      returnError(res, 400, "missing or invalid name field");
      return;
    }

    // check for missing or invalid 'metadata field from client
    if (typeof fields.metadata !== "string") {
      returnError(res, 400, "missing or invalid metadata field");
      return;
    }

    // prepare archive
    const tourName = fields.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[\/\?\=&]/g, "");
    const zipName = tourName + "-" + new Date().valueOf() + ".zip";
    const output = fs.createWriteStream(toursLoc + zipName);
    const archive = archiver("zip");

    // return errors to client
    archive.on("error", err => {
      returnError(res, 500, "error creating zip");
      return;
    });

    // log warnings but continue
    archive.on("warning", err => {
      console.error(err);
    });

    // fired when file is done being written
    output.on("close", () => {
      console.log("zip written. " + archive.pointer() + " total bytes");
      // send success
      res
        .status(201)
        .send(JSON.stringify({ status: 201, message: "upload successful" }));
    });

    archive.pipe(output);

    // add metadata as file
    archive.append(fields.metadata, { name: "metadata.json" });

    // add files of size > 0
    for (const f in files) {
      // Some members of `files' are actually arrays. These are from HTML file
      // inputs with the `multiple' attribute
      if (Array.isArray(files[f])) {
        // add all files of arrays
        for (const g of files[f]) {
          if (g.size > 0) {
            archive.file(g.path, { name: g.name });
          }
        }
      } else {
        // add singular files
        if (files[f].size > 0) {
          archive.file(files[f].path, { name: files[f].name });
        }
      }
    }

    // finish archive
    archive.finalize();
  });
});

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", (req, res) => {
  fs.readdir(toursLoc, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send(
        JSON.stringify({
          status: 500,
          message: "unable to read from tours directory"
        })
      );
      return;
    }

    // filter out files that don't start with the name we're looking for
    files = files.filter(f => f.startsWith(req.params.name));

    // if no files left 404
    if (files.length < 1) {
      res.status(404).send(
        JSON.stringify({
          status: 404,
          message: "couldn't find tour with the name " + req.params.name
        })
      );
      return;
    }

    // return the lexigraphically last filename, it's the most recent
    res.status(200).sendFile(toursLoc + files.sort()[files.length - 1]);
  });
});

/**
 * returns a string of random numbers and letters, n characters long
 * @param {number} n length of the random string
 * @return {string} a random string
 */
const randName = n => {
  const l = "1234567890abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < n; ++i) {
    out += l[Math.floor(Math.random() * 36)];
  }
  return out;
};

/**
 * Sends an error to the client with a specified status code and message
 * @param {Response} res response object to send to
 * @param {number} code HTTP status code
 * @param {string} message message to send
 */
const returnError = (res, code, message) => {
  console.error(message);
  res.status(code).send(
    JSON.stringify({
      status: code,
      message: message
    })
  );
};

app.listen(3000, () => {
  console.log("Now listening on port 3000...");
});
