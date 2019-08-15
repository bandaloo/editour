# Backend

This Node.js project allows you to upload any number of files, which are zipped
and stored with a given name. If you upload to the same name twice, a new zip is
created. When you request `/tours/:name` it will return the most recent zip with
the given name

## Installation

```
npm install
npm start
```

Navigate to `http://localhost:3000/` and upload some files. Then request them at
`http://localhost:3000/tour/:name` (replace `:name` with the name you input)
