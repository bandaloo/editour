const express = require("express");
const logger = require("./logger");

/**
 * Logs an error, then sends it to the client with a specified status code
 * and message
 * @param {express.Response} res response object to send to
 * @param {number} code HTTP status code, e.g. 404
 * @param {string} message message to send
 */
const returnError = (res, code, message) => {
  logger.error(message);

  res.status(code).header("Content-type", "application/json").send(
    JSON.stringify({
      status: code,
      message: message
    })
  );
}

module.exports = returnError;