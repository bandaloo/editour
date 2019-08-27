const express = require("express");

/**
 * Front-pads a number with zeroes so it is exactly two digits
 * @param {number} n a one- or two-digit number
 * @return {string} the input padded to two digits
 */
const to2Digits = n => {
  if ((n = Math.floor(n)) < 0 || n > 99) {
    throw new Error("to2Digits: invalid n: " + n);
  }
  return n.toString().padStart(2, "0");
};

/**
 * returns the current local date and time as a string, in a format like:
 *   '[25/08/2019:11:18:59 -540] '
 * @return {string} the date/time string
 */
const dateTimeString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  let out = "[" + to2Digits(d.getDate()) + "/";
  out += to2Digits(d.getMonth() + 1) + "/" + d.getFullYear();
  out += ":" + to2Digits(d.getHours()) + ":";
  out += to2Digits(d.getMinutes()) + ":";
  out += to2Digits(d.getSeconds()) + " ";
  if (offset >= 0) out += "+";
  out += offset.toString().padStart(3, "0") + "] ";
  return out;
};

/**
 * writes a string to the log, prepended by the current date and time
 * @param {string} s the string to log
 */
const log = s => {
  // get the date/time string
  console.log(dateTimeString() + s);
};

/**
 * logs information about a request
 * @param {express.Request} req the request object
 */
const logRequest = req => {
  let s = req.ip + " " + '"' + req.method + " " + req.path + " ";
  s += req.protocol + "/" + req.httpVersion + '"';
  s = dateTimeString() + s;
  console.log(s);
};

/**
 * logs an error
 * @param {string} s the error string to log
 */
const error = s => {
  console.error(dateTimeString() + "ERROR " + s);
};

module.exports = {
  log,
  logRequest,
  error
};
