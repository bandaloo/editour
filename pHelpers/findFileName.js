/**
 * finds and returns the most recent zip file with the given name in the
 * among the given filenames
 * @param {string[]} files list of filenames
 * @param {string} name the name of the tour we're searching for
 * @return {Promise<string>} a Promise containing the correct name of the
 * most recent tour zip
 */
const findFileName = (files, name) => {
  return new Promise((resolve, reject) => {
    if (typeof files === "undefined") {
      console.error("ASLKFJALKDSFJ");
      reject({
        status: 404,
        message: "No files found"
      });
    }

    // filter out files that aren't the name we're looking for
    // this regex works as long as the timestamp was made between 1973 and 5138
    files = files.filter(f =>
      new RegExp("^" + name + "-[0-9]{12,13}\\.zip$").test(f)
    );

    // if none left, throw an error because the filename we're looking for
    // doesn't exist
    if (files.length < 1) {
      reject({
        status: 404,
        message: "Couldn't find tour " + name
      });
    }

    // return the lexigraphically last matching filename, that's the most recent
    resolve(files.sort()[files.length - 1]);
  });
};

module.exports = findFileName;
