# Editour

This is a tool to make it easier to define regions for the Kyoto VR tour app.

## Installation

```
$ npm install
$ npm start
```

Navigate to `http://localhost:3000/` and upload some files. Then request them at
`http://localhost:3000/tour/:name` (replace `:name` with the name you input).

### Systemd

To run the server as a systemd service (recommended), copy `editour.service` to
`/lib/systemd/system/`. Then use systemctl to control it like so:

```
# systemctl enable editour
# systemctl start editour
```

Now systemd will handle starting the server at startup and restarting it if it
crashes.

### forever

You can also run the server as a daemon using [forever](https://www.npmjs.com/package/forever).

Edit `autostart.sh` so that it points to the correct directory where index.js
is, then start the server with `./autostart.sh start` and stop it with
`./autostart.sh stop`.

## Code Formatter

Use the Prettier code formatter when making PRs

## Testing

We used mocha for testing. Make sure the server is running with `npm start`
first, then run `npm test` and make sure all tests pass before pushing.

**Caution**: running the test suite will wipe out all tour zips and temp
directories, so don't do it if you have anything important in there

## API Documentation

Here is a list of API functions the backend handles. The response is usually a
JSON like this:

```
{
    "status": 400,
    "message": "Missing or invalid metadata field"
}
```

The status is an HTTP status code like 200 or 404, and the message is a string
or stringified JSON that contains the data of the response.

### GET `/edit/:name`

Returns the metadata file of the most recent tour with the given name. If
successful, it returns a status of 200 and the stringified metadata as the
message. If no tour with the given name is found it returns 404, and if the
server encounters an internal error while processing the request it returns 500.

### GET `/tour/:name`

This is the only API endpoint for which the response is not a JSON. Instead, the
response is the zip file of the most recent version of the tour with the given
name. Returns 404 if a tour with the given name isn't found or a 500 if there is
an internal server error while processing the request.

### GET `/tours`

Gets a list of unique tours on the server, returning a list of their names as
the message of its response.  Returns 200 if successful or 500 if there is an
internal server error while processing the request.

### POST `/edit`

Used for editing an existing tour. This request should contain the fields
`tourName`, `oldName`, and `metadata`, along with any number of files. The
server will use the new metadata as well as the old and new files to create a
new version of an existing tour. Returns 201 if the tour was edited
successfully, 400 if the request was invalid, 404 if the requested tour couldn't
be found, or 500 if a server error occurred while processing the request.

### POST `/upload`

Used for uploading a new tour. This request should include a `tourName` field
and a `metadata` field, along with any number of files. It verifies the uploaded
tour and creates a zip for it on the server. Sends a 201 if the tour was created
successfully, a 400 if the request is invalid, or a 500 if a server error is
encountered.


### DELETE `/tour/:name`

Deletes all versions of the tour with the given name from the server. Returns
200 if successful, along with a message saying how many versions were deleted,
404 if no tour with that name could be found, or 500 if a server error was
encountered.
