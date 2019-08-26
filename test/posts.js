const mocha = require("mocha");
const supertest = require("supertest");
const assert = require("assert");
const admZip = require("adm-zip");

const server = supertest.agent("localhost:3000");

const testFileDir = __dirname + "/files/";

describe("POST Methods", function() {
  describe("/upload endpoint", function() {
    it("Should return 201 and create zip from correct form submission", function(done) {
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
          .field("tourName", "myTest")
          .field("metadata", JSON.stringify(metadata))
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
            "Uploaded under the name 'mytest'"
          );
          return new Promise((resolve, reject) => {
            // make sure there's a new zip by GETting it from the server
            server
              .get("/tour/mytest")
              .expect(200)
              .expect("Content-type", /zip/)
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res);
              });
          });
        })
        .then(res => {
          assert.strictEqual(res.status, 200);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});
