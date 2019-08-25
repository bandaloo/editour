class Helpers {
  /**
   * basic constructor. Throws error if logger is ommitted
   * @param {Logger} logger a logger objct. Required
   * @constructor
   */
  constructor(logger) {
    if (!logger) {
      throw new Error("Helpers constructor missing logger");
    }
    // constants
    this.toursLoc = __dirname + "/tours/"; // TODO maybe change this?
    this.tempLoc = __dirname + "/temp/"; // TODO maybe change this?
    this.logger = logger;
  }

  /**
   * Logs an error, then sends it to the client with a specified status code
   * and message
   * @param {Response} res response object to send to
   * @param {number} code HTTP status code, e.g. 404
   * @param {string} message message to send
   * @param {Logger} logger a logger object
   */
  returnError(res, code, message) {
    this.logger.error(message);
    res.status(code).send(
      JSON.stringify({
        status: code,
        message: message
      })
    );
  }

  /**
   * returns a string of random numbers and letters, n characters long
   * @param {number} n length of the random string
   * @return {string} a random string
   */
  randName(n) {
    const l = "1234567890abcdefghijklmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < n; ++i) {
      out += l[Math.floor(Math.random() * 36)];
    }
    return out;
  }

  /**
   * Looks up a filename in the toursLoc folder and returns the most recent
   * matching filename. For example, if you search for `mytour`, it will return
   * something like `mytour-1566696661145.zip`
   * @param {string[]} files list of filenames in the directory we're searching
   * @param {string} name the name to look for
   * @return {string | null} the full filename of the found file, or null if not found
   */
  lookupFileName(files, name) {
    // filter out files that aren't the name we're looking for
    // this regex works as long as the timestamp was made between 1973 and 5138
    files = files.filter(f =>
      new RegExp("^" + name + "-[0-9]{12,13}\\.zip$").test(f)
    );

    // if none left, return null because the filename we're looking for doesn't exist
    if (files.length < 1) {
      return null;
    }

    // return the lexigraphically last matching filename, that's the most recent
    return files.sort()[files.length - 1];
  }
}

module.exports = Helpers;
