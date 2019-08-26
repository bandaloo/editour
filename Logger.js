const fs = require("fs");
const express = require("express");

/**
 * This object handles logging events from the server. By default logs are
 * stored in the `log/` subdirectory of the current folder, but you can change
 * this if you wish. It may also be a good idea to set up logrotate for
 * editour. See `man logrotate` for more information.
 */
class Logger {
  /**
   * Initializes the logger by opening the write stream to the log file.
   * To follow UNIX conventions you may want to pass it something like this:
   * `new Logger('/var/log/editour');`
   *
   * @param {string} [logFilePath] the path to the location where the log file
   * will be written. Optional.
   * @constructor
   */
  constructor(logFilePath) {
    if (!logFilePath) {
      logFilePath = __dirname + "/log/editour.log";
    }
    this.path = logFilePath;

    this.ws = fs.createWriteStream(this.path);
  }

  /**
   * returns the current local date and time as a string, in a format like:
   *   '[25/7/2019:11:18:59 -540] '
   * @return {string} the date/time string
   */
  dateTimeString() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    let out = "[" + d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
    out += ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    out += " ";
    if (offset >= 0) out += "+";
    out += offset + "] ";
    return out;
  }

  /**
   * writes a string to the log, prepended by the current date and time
   * @param {string} s the string to log
   */
  log(s) {
    // get the date/time string
    this.ws.write(this.dateTimeString() + s + "\n");
  }

  /**
   * logs information about a request
   * @param {express.Request} req the request object
   */
  logRequest(req) {
    let s = req.ip + " " + '"' + req.method + " " + req.path + " ";
    s += req.protocol + "/" + req.httpVersion + '"';
    s = this.dateTimeString() + s;
    this.ws.write(s + "\n");
  }

  /**
   * logs an error
   * @param {string} s the error string to log
   */
  error(s) {
    this.ws.write(this.dateTimeString() + "ERROR " + s + "\n");
  }
}

module.exports = Logger;
