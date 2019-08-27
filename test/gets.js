const mocha = require("mocha");
const supertest = require("supertest");
const assert = require("assert");

const server = supertest.agent("localhost:3000");
const testFileDir = __dirname + "/files/";
let metadata;

before(function(done) {
  // upload a zip to test getting it
  metadata = {
    regions: [
      {
        name: "unnamed region x6ozqq",
        points: [
          { lat: 34.97463008623145, lng: 135.95066070556643 },
          { lat: 34.97473558142708, lng: 135.95984458923343 },
          { lat: 34.97698611323032, lng: 135.9720325469971 },
          { lat: 34.98176828797155, lng: 135.9616041183472 },
          { lat: 34.97930690938016, lng: 135.9463691711426 },
          { lat: 34.97572019670047, lng: 135.9438800811768 },
          { lat: 34.97691578504756, lng: 135.95525264739993 },
          { lat: 34.9740322775562, lng: 135.9449100494385 },
          { lat: 34.97424326935158, lng: 135.94799995422366 },
          { lat: 34.974067442893165, lng: 135.94864368438724 }
        ],
        audio: ["cruel-angels-thesis.mp3"],
        images: ["shinji.png", "misato.jpg"]
      }
    ]
  };
  new Promise((resolve, reject) => {
    server
      .post("/upload")
      .expect("Content-type", /json/)
      .expect(201)
      .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
      .attach("image_name_x6ozqq", testFileDir + "shinji.png")
      .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
      .field("tourName", "This Tour")
      .field("metadata", JSON.stringify(metadata))
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
  })
    .then(res => {
      done();
    })
    .catch(err => {
      done(err);
    });
});

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
    it("Should serve static index on a GET to /index.html", function(done) {
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
    it("Should properly serve up zips", function(done) {
      // request the tour we juse created
      server
        .get("/tour/this-tour")
        .expect(200)
        .expect("Content-type", /application\/zip/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 200);
          done();
        });
    });

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

  describe("GET /edit/:name endpoint", function() {
    it("Should properly serve up metadata", function(done) {
      server
        .get("/edit/this-tour")
        .expect(200)
        .expect("Content-type", /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, 200);
          assert.deepEqual(JSON.parse(res.body.message), metadata);
          done();
        });
    });

    it("Should return 404 when tour not found", function(done) {
      server
        .get("/edit/invalid-tour-name")
        .expect(404)
        .expect("Content-type", /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 404);
          assert.strictEqual(res.body.status, 404);
          assert.strictEqual(res.body.message, "Couldn't find tour invalid-tour-name");
          done();
        })
    })
  });
});
