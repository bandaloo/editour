/**
 * returns a string of random numbers and letters, n characters long
 * @param {number} n length of the random string
 * @return {string} a random string
 */
const randName = (n) => {
  const l = "1234567890abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < n; ++i) {
    out += l[Math.floor(Math.random() * 36)];
  }
  return out;
}

module.exports = randName;
