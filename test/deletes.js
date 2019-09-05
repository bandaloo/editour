const mocha = require("mocha");
const supertest = require("supertest");
const assert = require("assert");

const server = supertest.agent("localhost:3000");
const testFileDir = __dirname + "/files/";

describe("DELETE methods", function() {
  describe("DELETE /tour/:name endpoint", function() {
    it("Should return 404 when tour not found", function(done) {
      server
        .delete("/tour/invalid-name")
        .expect(404)
        .expect("Content-type", /json/)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 404);
          assert.strictEqual(res.body.status, 404);
          assert.strictEqual(
            res.body.message,
            "Couldn't find tour invalid-name"
          );
          done();
        });
    });

    it("Should delete all versions of a tour", function(done) {
      // create a tour
      const metadata = {
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
            images: ["shinji.png"]
          }
        ]
      };
      server
        .post("/upload")
        .expect("Content-type", /json/)
        .expect(201)
        .attach("audio_name_x6ozqq", testFileDir + "cruel-angels-thesis.mp3")
        .attach("image_name_x6ozqq", testFileDir + "shinji.png")
        .field("tourName", "deleteTest")
        .field("metadata", JSON.stringify(metadata))
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.strictEqual(res.status, 201);
          assert.strictEqual(res.body.status, 201);
          assert.strictEqual(
            res.body.message,
            "Uploaded under the name 'deletetest'"
          );
          // now edit that tour so there's another version
          const newMetadata = {
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
            .post("/edit")
            .expect("Content-type", /json/)
            .expect(201)
            .attach("image_name_x6ozqq", testFileDir + "misato.jpg")
            .field("tourName", "deletetest")
            .field("oldName", "deletetest")
            .field("metadata", JSON.stringify(newMetadata))
            .end((err, res) => {
              if (err) {
                done(err);
              }
              assert.strictEqual(res.status, 201);
              assert.strictEqual(res.body.status, 201);
              assert.strictEqual(
                res.body.message,
                "Updated under the name 'deletetest'"
              );
              // now delete them all
              server
                .delete("/tour/deletetest")
                .expect("Content-type", /json/)
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    done(err);
                  }
                  assert.strictEqual(res.status, 200);
                  assert.strictEqual(res.body.status, 200);
                  assert.strictEqual(
                    res.body.message,
                    "Successfully deleted 2 versions of deletetest"
                  );
                  // make sure the files are gone
                  require("../pHelpers")
                    .getTours(require("../constants").toursLoc)
                    .then(files => {
                      for (const f of files) {
                        if (f === "deletetour") {
                          done("not deleted");
                        }
                      }
                      done();
                    })
                    .catch(err => {
                      done(err);
                    });
                });
            });
        });
    });
  });
});
