const express = require("express");
const formidable = require("formidable");
const archiver = require("archiver");
const fs = require("fs");
const app = express();

const toursLoc = __dirname + "/tours/"; // TODO maybe change this?
const tempLoc = __dirname + "/temp/"; // TODO maybe change this?

// static directory
// requests that don't match any of the other endpoints will be served from here
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

  // parse incoming form data
  form.parse(req, (err, fields, files) => {
    if (err) {
      // if something goes wrong while parsing it's probably an invalid request
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
    let parsedMetadata;
    try {
      if (typeof fields.metadata !== "string") {
        throw new Error("invalid metadata type");
      }
      parsedMetadata = JSON.parse(fields.metadata);
    } catch (err) {
      returnError(res, 400, "missing or invalid metadata field");
      return;
    }

    // check for duplicate filenames in metadata
    let filenames;
    try {
      // this is a horrible one-line hack that parses the metadata field,
      // extracts the arrays for the "audio" and "images" field of each region,
      // and flattens them together into one big sorted array of filenames
      /** @type string[] */
      filenames = [].concat
        .apply(
          [],
          parsedMetadata["regions"].map(
            x => x["audio"].concat(x["images"])
            // TODO ^ if more file fields are added they should be added here
          )
        )
        .sort();

      // now check to make sure all of the filenames are unique
      for (let i = 0; i < filenames.length - 1; ++i) {
        if (filenames[i] === filenames[i + 1]) {
          throw new Error("Duplicate file found");
        }
      }
    } catch (err) {
      returnError(res, 400, "multiple files with the same name");
      return;
    }

    try {
      // make sure all uploaded filenames are in the metadata file
      // we check this here so that it doesn't get halfway through writing the
      // zip before realizing an error. That would leave us with a half-written,
      // corrupted zip
      for (const f in files) {
        // Some members of `files' are actually arrays. These are from HTML file
        // inputs with the `multiple' attribute
        if (Array.isArray(files[f])) {
          // add all files of array
          for (const g of files[f]) {
            // ignore files with size 0, they won't be added to the zip anyway
            if (g.size > 0 && filenames.indexOf(g.name) < 0) {
              throw new Error(
                "uploaded file " + g.name + " not present in metadata"
              );
            }
          }
        } else {
          // check singular file inputs
          // ignore files with size 0, they won't be added to the zip anyway
          if (files[f].size > 0 && filenames.indexOf(files[f].name) < 0) {
            throw new Error(
              "uploaded file " + files[f].name + " not present in metadata"
            );
          }
        }
      }
    } catch (err) {
      console.error(err.message);
      returnError(res, 400, err.message);
      return;
    }

    // format input name to it's URL-friendly
    const tourName = fields.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[\/\?\=&]/g, "");
    const zipName = tourName + "-" + new Date().valueOf() + ".zip";

    // prepare archive
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
        // add singular file inputs
        if (files[f].size > 0) {
          archive.file(files[f].path, { name: files[f].name });
        }
      }
    }

    // add metadata as file
    archive.append(fields.metadata, { name: "metadata.json" });

    // finish archive
    archive.finalize();
  });
});

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", (req, res) => {
  fs.readdir(toursLoc, (err, files) => {
    if (err) {
      returnError(res, 500, "unable to read from tours directory");
      return;
    }

    // filter out files that don't start with the name we're looking for
    files = files.filter(f => f.startsWith(req.params.name));

    // if no files left 404
    if (files.length < 1) {
      returnError(res, 404, "couldn't find tour " + req.params.name);
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
 * Logs an error to the console, then sends it to the client with a specified
 * status code and message
 * @param {Response} res response object to send to
 * @param {number} code HTTP status code, e.g. 404
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
