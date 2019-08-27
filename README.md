# Editour

This is a tool to make it easier to define regions for the Kyoto VR tour app.

## Installation

```
npm install
npm start
```

Navigate to `http://localhost:3000/` and upload some files. Then request them at
`http://localhost:3000/tour/:name` (replace `:name` with the name you input).

Running with `npm run prod` will redirect stdout and stderr to
`./log/editour.log`

## Code Formatter

Use the Prettier code formatter when making PRs

## Testing

We used mocha for testing. Make sure the server is running with `npm start`
first, then run `npm test` and make sure all tests pass before pushing
