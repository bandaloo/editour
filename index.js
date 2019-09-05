const express = require("express");
const app = express();
const logger = require("./logger");
const endpoints = require("./endpoints");

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// get port from environment variable, or use 3000 as the default
const port = process.env.NODE_PORT || 3000;

// endpoint for file uploads
app.post("/upload", endpoints.postUpload);

// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get("/tour/:name", endpoints.getTour);

// endpoint to request just the metadata from a tour. Used for editing a tour
app.get("/edit/:name", endpoints.getEdit);

// endpoint to edit an existing tour
app.post("/edit", endpoints.postEdit);

// returns a list of tour names on the server
app.get("/tours", endpoints.getTours);

// deletes a particular tour from the server
app.delete("/tour/:name", endpoints.deleteTour);

app.listen(port, () => {
  logger.log("Started listening on port " + port + "...");
});
