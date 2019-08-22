// freezing an Object is an enum basically
const stateEnum = Object.freeze({
  // don't use 0 due to boolean conversion
  drawing: 1,
  selecting: 2
});

const colorEnum = Object.freeze({
  // TODO pick some better colors
  drawing: "#ff0000",
  region: "#0000ff",
  uploadSuccessful: "#3ddb62",
  uploadFailed: "#f26868"
});
