const fs = require("fs");
const helpers = require("./helpers");
const archiver = require("archiver");

/**
 * simple helper that puts two arguments into an object
 * @param {number} s http status code
 * @param {string} m message to send to client
 * @return {{status: number, message: string}} the status and message combined into an
 * object
 */
const outObj = (s, m) => {
  return { status: s, message: m };
};

/**
 * parses a form request, passing a status code and message to the callback
 * @param {Error} err a possible error in parsing the request
 * @param {Fields} fields fields submitted in the form
 * @param {Files} files uploaded files
 * @param {function ({status: number, message: string}) => void} cb callback
 */
const parseForm = (err, fields, files, cb) => {
  if (err) {
    // if something goes wrong while parsing it's probably an invalid request
    cb(outObj(400, "error parsing form"));
    return;
  }
  console.log("parsing request form...");

  // check for missing or invalid 'name' field from client
  if (typeof fields.tourName !== "string") {
    cb(outObj(400, "missing or invalid name field"));
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
    cb(outObj(400, "missing or invalid metadata field"));
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
    cb(outObj(400, "multiple files with the same name"));
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
    cb(outObj(400, err.message));
    return;
  }

  // format input name to it's URL-friendly
  const tourName = fields.tourName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/\?\=&]/g, "");
  const zipName = tourName + "-" + new Date().valueOf() + ".zip";

  // prepare archive
  const output = fs.createWriteStream(helpers.toursLoc + zipName);
  const archive = archiver("zip");

  // return errors to client
  archive.on("error", err => {
    cb(outObj(500, "error creating zip"));
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
    cb(outObj(201, "successfully uploaded as " + tourName));
    return;
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
};

module.exports = parseForm;
