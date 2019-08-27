const mocha = require("mocha");
const supertest = require("supertest");
const assert = require("assert");

const server = supertest.agent("localhost:3000");

describe("GET Methods", function() {
  describe("Static pages", function() {
    it("Should serve static index on a GET to /", function(done) {
      server
        .get("/")
        .expect("Content-type", /text\/html/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 200);
          done();
        });
    });
    it("Should serve statis index on a GET to /index.html", function(done) {
      server
        .get("/index.html")
        .expect("Content-type", /text\/html/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 200);
          done();
        });
    });
    it("Should return 404 on other unknown request", function(done) {
      server
        .get("/invalid")
        .expect("Content-type", /text\/html/)
        .expect(404)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 404);
          done();
        });
    });
  });

  describe("GET /tour/:name endpoint", function() {
    it("Should return 404 when zip not found", function(done) {
      server
        .get("/tour/invalid-name")
        .expect(404)
        .expect("Content-type", /json/)
        .end((err, res) => {
          assert.strictEqual(res.status, 404);
          assert.strictEqual(res.body.status, 404);
          assert.strictEqual(
            res.body.message,
            "Couldn't find tour invalid-name"
          );
          done();
        });
    });
  });
});
