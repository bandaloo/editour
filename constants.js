const express = require('express');
const logger = require('./logger');

/**
 * You can change these freely, these are just the default
 */
const constants = {
  toursLoc: __dirname + "/tours/",
  tempLoc: __dirname + "/temp/",
  logPath: __dirname + "/log/editour.log",

  /**
   * returns a string of random numbers and letters, n characters long
   * @param {number} n length of the random string
   * @return {string} a random string
   */
  randName: (n) => {
    const l = "1234567890abcdefghijklmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < n; ++i) {
      out += l[Math.floor(Math.random() * 36)];
    }
    return out;
  },

  /**
   * Logs an error, then sends it to the client with a specified status code
   * and message
   * @param {express.Response} res response object to send to
   * @param {number} code HTTP status code, e.g. 404
   * @param {string} message message to send
   */
  returnError: (res, code, message) => {
    logger.error(message);

    res.status(code).header("Content-type", "application/json").send(
      JSON.stringify({
        status: code,
        message: message
      })
    );
  }
};


module.exports = constants;
