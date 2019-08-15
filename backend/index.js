const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const jsZip = require('jszip');
const app = express();

const toursLoc = __dirname + '/tours/'; // TODO maybe change this?
const tempLoc = __dirname + '/temp/'; // TODO maybe change this?

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // TODO serve the actual static front-end content
});


// endpoint for file uploads
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    res.write(JSON.stringify(
        {'status': 201, 'message': 'Received!'}
    ));
    console.log('Completed\n');
    res.end();
  });

  // log progress
  form.on('progress', (bytesReceived, bytesExpected) => {
    const percent= (bytesReceived / bytesExpected) * 100;
    console.log(percent.toFixed(2) + '% complete...');
    res.write(JSON.stringify(
        {'status': 202, 'percentComplete': percent.toFixed(2)}
    ));
  });

  // log errors
  form.on('error', (err) => {
    console.error(err);
    res.status(500).send(JSON.stringify(
        {'status': 500, 'error': err}
    ));
  });

  // save files to temp location initially
  form.on('fileBegin', (name, file) => {
    file.path = tempLoc + file.name;
  });
});

app.listen(3000, () => {
  console.log('Now listening on port 3000...');
});
