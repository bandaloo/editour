const mocha = require("mocha");
const supertest = require("supertest");
const assert = require("assert");

const server = supertest.agent("localhost:3000");

const testFileDir = __dirname + "/files/";
let basicMetadata;

after(function() {
  require("child_process").exec("rm -r temp/*/ tours/*.zip");
})

before(function(done) {
  basicMetadata = {
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
  server
    .post("/upload")
    .expect("Content-type", /json/)
    .expect(201)
    .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
    .attach("image_name_x6ozqq", testFileDir + "shinji.png")
    .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
    .field("tourName", "myTest")
    .field("metadata", JSON.stringify(basicMetadata))
    .end((err, res) => {
      if (err) {
        done(err);
      }
      done();
    });
});

describe("POST Methods", function() {
  describe("POST /upload endpoint", function() {
    it("Should return 201 and create zip from correct form submission", function(done) {
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(201)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
        .field("tourName", "myTest")
        .field("metadata", JSON.stringify(basicMetadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 201);
          assert.strictEqual(res.body.status, 201);
          assert.strictEqual(
            res.body.message,
            "Uploaded under the name 'mytest'"
          );
          done();
        });
    });

    it("Should return 400 with no tourName field", function(done) {
      const metadata = {
        regions: [
          {
            name: "my region",
            points: [
              { lat: 34.97463008623145, lng: 135.95066070556643 },
              { lat: 34.97473558142708, lng: 135.95984458923343 },
              { lat: 34.97698611323032, lng: 135.9720325469971 }
            ],
            audio: [],
            images: []
          }
        ]
      };
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(400)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
        // .field("tourName", "myTest")
        .field("metadata", JSON.stringify(metadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 400);
          assert.strictEqual(res.body.status, 400);
          assert.strictEqual(
            res.body.message,
            "Missing or invalid tourName field"
          );
          done();
        });
    });

    it("Should return 400 with no metadata field", function(done) {
      const metadata = {
        regions: [
          {
            name: "my region",
            points: [
              { lat: 34.97463008623145, lng: 135.95066070556643 },
              { lat: 34.97473558142708, lng: 135.95984458923343 },
              { lat: 34.97698611323032, lng: 135.9720325469971 }
            ],
            audio: [],
            images: []
          }
        ]
      };
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(400)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
        .field("tourName", "myTest")
        // .field("metadata", JSON.stringify(metadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 400);
          assert.strictEqual(res.body.status, 400);
          assert.strictEqual(
            res.body.message,
            "Missing or invalid metadata field"
          );
          done();
        });
    });

    it("Should return 400 with duplicate files in metadata", function(done) {
      const metadata = {
        regions: [
          {
            name: "my region",
            points: [
              { lat: 34.97463008623145, lng: 135.95066070556643 },
              { lat: 34.97473558142708, lng: 135.95984458923343 },
              { lat: 34.97698611323032, lng: 135.9720325469971 }
            ],
            audio: ["cruel-angels-thesis.mp3"],
            images: []
          },
          {
            name: "my other region",
            points: [
              { lat: 34.83141242342445, lng: 135.99029230923093 },
              { lat: 34.90213295023509, lng: 135.9920589235823 },
              { lat: 34.9930290101391, lng: 135.99320930239209 }
            ],
            audio: ["cruel-angels-thesis.mp3"],
            images: ["shinji.png"]
          }
        ]
      };
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(400)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .field("tourName", "myTest")
        .field("metadata", JSON.stringify(metadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 400);
          assert.strictEqual(res.body.status, 400);
          assert.strictEqual(res.body.message, "Duplicate files in metadata");
          done();
        });
    });

    it("Should return 400 with files in metadata missing from upload", function(done) {
      const metadata = {
        regions: [
          {
            name: "my region",
            points: [
              { lat: 34.97463008623145, lng: 135.95066070556643 },
              { lat: 34.97473558142708, lng: 135.95984458923343 },
              { lat: 34.97698611323032, lng: 135.9720325469971 }
            ],
            audio: ["gunbuster-opening.mp3"],
            images: ["this-file-does-not-exist.wav"]
          },
          {
            name: "my other region",
            points: [
              { lat: 34.83141242342445, lng: 135.99029230923093 },
              { lat: 34.90213295023509, lng: 135.9920589235823 },
              { lat: 34.9930290101391, lng: 135.99320930239209 }
            ],
            audio: ["cruel-angels-thesis.mp3"],
            images: ["shinji.png"]
          }
        ]
      };
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(400)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("audio_name_x6ozqq", testFileDir + "gunbuster-opening.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .field("tourName", "myTest")
        .field("metadata", JSON.stringify(metadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 400);
          assert.strictEqual(res.body.status, 400);
          assert.strictEqual(
            res.body.message,
            "File this-file-does-not-exist.wav in metadata not present on disk"
          );
          done();
        });
    });
  });

  describe("POST /edit endpoint", function() {
    it("Should return 200 and edit tour on successful POST", function(done) {
      const newMetadata = {
        regions: [
          {
            name: "my region",
            points: [
              { lat: 34.97463008623145, lng: 135.95066070556643 },
              { lat: 34.97473558142708, lng: 135.95984458923343 },
              { lat: 34.97698611323032, lng: 135.9720325469971 },
              { lat: 34.98176828797155, lng: 135.9616041183472 },
              { lat: 34.97930690938016, lng: 135.9463691711426 },
              { lat: 34.97572019670047, lng: 135.9438800811768 },
              { lat: 34.97691578504756, lng: 135.95525264739993 }
            ],
            audio: ["cruel-angels-thesis.mp3"],
            images: ["shinji.png"]
          },
          {
            name: "my other region",
            points: [
              { lat: 34.97930690938016, lng: 135.9463691711426 },
              { lat: 34.97572019670047, lng: 135.9438800811768 },
              { lat: 34.97691578504756, lng: 135.95525264739993 }
            ],
            audio: ["gunbuster-opening.mp3"],
            images: []
          }
        ]
      };
      // now post to the edit endpoint with one region deleted and an image added
      new Promise((resolve, reject) => {
        server
          .post("/edit")
          .expect("Content-type", /json/)
          .expect(201)
          .attach("audio_name_10319rj", testFileDir + "gunbuster-opening.mp3")
          .field("tourName", "mytest")
          .field("metadata", JSON.stringify(newMetadata))
          .end((err, res) => {
            if (err) {
              reject(err);
            }
            resolve(res);
          });
      })
        .then(res => {
          assert.strictEqual(res.status, 201);
          assert.strictEqual(res.body.status, 201);
          assert.strictEqual(
            res.body.message,
            "Updated under the name 'mytest'"
          );
          return new Promise((resolve, reject) => {
            // get the metadata from the server to make sure it was changed
            server
              .get("/edit/mytest")
              .expect("Content-type", /json/)
              .expect(200)
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.body.status, 200);
                assert.deepEqual(JSON.parse(res.body.message), newMetadata);
                done();
                resolve();
              });
          });
        })
        .catch(err => {
          done(err);
        });
    });

    it("Should return 404 with invalid tour name", function(done) {
      server
        .post("/edit")
        .expect("Content-type", /json/)
        .expect(404)
        .field("tourName", "invalid-name-here")
        .field("metadata", JSON.stringify({ asdf: "This shouldn't matter" }))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 404);
          assert.strictEqual(res.body.status, 404);
          assert.strictEqual(res.body.message, "Couldn't find tour invalid-name-here");
          done();
        });
    });
  });
});
