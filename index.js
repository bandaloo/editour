const express = require('express');
const formidable = require('formidable');
const archiver = require('archiver');
const fs = require('fs');
const app = express();

const toursLoc = __dirname + '/tours/'; // TODO maybe change this?
const tempLoc = __dirname + '/temp/'; // TODO maybe change this?

// serve index
/*
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // TODO serve the actual static front-end content
});
*/

// static directory
app.use(express.static(__dirname + '/static'));


// endpoint for file uploads
app.post('/upload', (req, res) => {
  const tempDirPath = tempLoc + randName(10) + '/';
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    // send errors back to client
    if (err) {
      res.status(500).send(JSON.stringify(
          {'status': 500, 'message': err}
      ));
      return;
    }
    console.log(fields);
    console.log(files);
    // check for missing or invalid 'name' field from client
    if (typeof fields.name !== 'string') {
      res.status(400).send(JSON.stringify(
          {'status': 400, 'message': 'Missing or invalid name field'}
      ));
      return;
    }

    // create a file to stream archive data to
    console.log('zipping and moving...');
    const zipName = fields.name + '-' + new Date().valueOf() + '.zip';
    const output = fs.createWriteStream(toursLoc + zipName);
    const archive = archiver('zip');

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
      console.log('Zip written. ' + archive.pointer() + ' total bytes\n');
      // send successful message to client
      res.status(201).send(JSON.stringify(
          {'status': 201, 'message': 'Received!'}
      ));
    });

    // This event is fired when the data source is drained no matter what was
    // the data source. It is not part of this library but rather from the
    // NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
      console.log('Data has been drained');
    });

    // good practice to catch warnings (e.g. stat failures and other
    // non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
        console.error(err);
      } else {
        // send errors back to client
        res.status(500).send(JSON.stringify(
            {'status': 500, 'message': err}
        ));
        return;
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      // send errors back to client
      res.status(500).send(JSON.stringify(
          {'status': 500, 'message': err}
      ));
      return;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // add the temp directory to the archive
    archive.directory(tempDirPath, false);
    // finalize to say we're done appending files
    archive.finalize();

    console.log('Completed');
  });

  // log progress
  form.on('progress', (bytesReceived, bytesExpected) => {
    const percent= (bytesReceived / bytesExpected) * 100;
    console.log(percent.toFixed(2) + '% complete...');
  });

  // log errors
  form.on('error', (err) => {
    console.error(err);
    res.status(500).send(JSON.stringify(
        {'status': 500, 'error': err}
    ));
    return;
  });

  // save files to temp location initially
  form.on('fileBegin', (name, file) => {
    try {
      fs.mkdirSync(tempDirPath, {recursive: true});
    } catch (err) {
      if (err.code !== 'EEXIST') {
        res.status(500).send(JSON.stringify(
            {'status': 500, 'message': 'Server failed to save files'}
        ));
        return;
      } else {
        // TODO make this generate a new name and try again on EEXIST
        // this should basically never happen so ¯\_(ツ)_/¯
      }
    }
    file.path = tempDirPath + file.name;
  });
});


// endpoint to request a tour zip
// should find the latest zip with a matching name and serve it
app.get('/tour/:name', (req, res) => {
  fs.readdir(toursLoc, (err, files) => {
    if (err) {
      res.status(500).send(JSON.stringify(
          {'status': 500, 'message': 'unable to read from tours directory'}
      ));
      return;
    }

    // filter out files that don't start with the name we're looking for
    files = files.filter((f) => f.startsWith(req.params.name));

    console.log(files);
    // if no files left 404
    if (files.length < 1) {
      res.status(404).send(JSON.stringify({
        'status': 404,
        'message': 'couldn\'t find tour with the name ' + req.params.name,
      }));
      return;
    }

    // return the lexigraphically last filename, it's the most recent
    res.status(200).sendFile(toursLoc + files.sort()[files.length - 1]);
  });
});


/**
 * returns a string of random numbers and letters, n characters long
 * @param {number} n length of the random string
 * @return {string} a random string
 */
const randName = (n) => {
  const l = '1234567890abcdefghijklmnopqrstuvwxyz';
  let out = '';
  for (let i = 0; i < n; ++i) {
    out += l[Math.floor(Math.random() * 36)];
  }
  return out;
};


app.listen(3000, () => {
  console.log('Now listening on port 3000...');
});
