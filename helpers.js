const toursLoc = __dirname + "/tours/"; // TODO maybe change this?
const tempLoc = __dirname + "/temp/"; // TODO maybe change this?

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

module.exports = {
  toursLoc,
  tempLoc,
  returnError,
  randName
};
