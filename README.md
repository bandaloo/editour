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
