"use strict";

// freezing an object is an enum basically
const stateEnum = Object.freeze({
  // don't use 0 due to boolean conversion
  drawing: 1,
  selecting: 2
});

const colorEnum = Object.freeze({
  // TODO pick some better colors
  drawing: "#ff0000",
  region: "#0000ff"
});

// last position of mouse on mouse move
var mouseLatLng;

// a list of region objects
var regions = {};

// list of points, which are lists of length 2 and contain numbers
var drawnPoints = [];

const sideNav = document.getElementById("sidenavid");

// list of temporarily shown lines used for drawing
var polyline = L.polyline([], { color: colorEnum.drawing });
var connectBack = L.polyline([], {
  color: colorEnum.drawing,
  dashArray: "4"
});
var previewLine = L.polyline([], {
  color: colorEnum.drawing,
  dashArray: "4",
  opacity: 0.5
});

var connectToMouse;

var state = stateEnum.selecting;

// currently defaulted to Ritsumeikan University
var myMap = L.map("mapid", {
  center: [34.982153, 135.963641],
  zoom: 17,
  zoomControl: false
});

// adding zoom control
L.control
  .zoom({
    position: "topright"
  })
  .addTo(myMap);

// using tile layer from openstreetmap (doesn't require api key)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// set event listener for shortcuts
document.addEventListener("keydown", function(e) {
  let code = e.keyCode;
  let key = String.fromCharCode(code);
  if (key == "S") {
    startDraw();
  } else if (key == "E") {
    endDraw();
  }
});
function randomHash() {
  return Math.random()
    .toString(36)
    .substring(7);
}

function startDraw() {
  console.log("start draw");
  state = stateEnum.drawing;
  // clear the latlngs of the temp drawing polylines
  polyline.setLatLngs([]);
  connectBack.setLatLngs([]);
  previewLine.setLatLngs([]);

  // add temp drawing polylines to map
  polyline.addTo(myMap);
  connectBack.addTo(myMap);
  previewLine.addTo(myMap);
}

// TODO make sure you can't create an illegal poly
function endDraw() {
  console.log("end draw");
  state = stateEnum.selecting;
  let found = false;
  drawnPoints.push(mouseLatLng);

  // handles coming up with same hash
  let hash, regionName;
  while (!found) {
    hash = randomHash();
    if (!regions[hash]) {
      found = true;
      regionName = "unnamed region " + hash;
      // add region to the list of regions
      regions[hash] = {
        points: drawnPoints,
        name: regionName
      };
    }
  }

  // add poly to the map
  L.polygon(drawnPoints).addTo(myMap);

  // remove lines from map
  polyline.remove();
  connectBack.remove();
  previewLine.remove();
  drawnPoints = [];

  addRegionDiv(hash, regionName);
}

function onMapClick(e) {
  console.log("clicked map at: " + e.latlng);
  if (state == stateEnum.drawing) {
    let coord = [e.latlng.lat, e.latlng.lng];
    drawnPoints.push(coord);
    polyline.addLatLng(coord);
    if (drawnPoints.length > 2) {
      connectBack.setLatLngs([
        drawnPoints[0],
        drawnPoints[drawnPoints.length - 1]
      ]);
    }
  }
}

function renameRegion(hash, newName) {
  regions[hash].name = newName;
}

function addRegionDiv(hash, name) {
  let id = "id_" + hash;
  let regionDiv = document.createElement("div");
  regionDiv.id = id;
  regionDiv.className = "sidebox";

  let regionName = document.createElement("h3");
  regionName.innerHTML = name;
  regionName.id = "name";
  regionDiv.appendChild(regionName);

  let renameDiv = makeRenameDiv(hash, regionName);
  renameDiv.display = "none";

  let buttonDiv = document.createElement("div");
  buttonDiv.classList.add("flex");

  let deleteButton = document.createElement("button");
  deleteButton.classList.add("button", "fillwidth");
  deleteButton.id = "deletebutton";
  deleteButton.innerHTML = "Delete";
  buttonDiv.appendChild(deleteButton);

  let renameButton = document.createElement("button");
  renameButton.classList.add("button", "bluebutton", "fillwidth");
  renameButton.id = "renamebutton";
  renameButton.innerHTML = "Rename";
  //renameButton.onclick = () => addRenameDiv(id);
  renameButton.onclick = () => toggleDisplay(renameDiv, "flex");
  buttonDiv.appendChild(renameButton);

  let infoButton = document.createElement("button");
  infoButton.classList.add("button", "orangebutton", "fillwidth");
  infoButton.id = "infobutton";
  infoButton.innerHTML = "Info";
  buttonDiv.appendChild(infoButton);

  regionDiv.appendChild(buttonDiv);
  regionDiv.appendChild(renameDiv);
  sideNav.appendChild(regionDiv);
}

function makeRenameDiv(hash, text) {
  // TODO change this so it is passed in a div object from above
  let renameDiv = document.createElement("div");
  renameDiv.classList.add("flex", "sidebox");

  let textDiv = document.createElement("div");
  textDiv.classList.add("flex"); // TODO might not even need this

  let input = document.createElement("input");
  input.type = "text";
  input.name = "regiontext"; // TODO check if we need this
  input.classList.add("input", "fillwidth");

  let button = document.createElement("button");
  button.classList.add("button", "greenbutton");
  button.innerHTML = "Okay";
  button.onclick = () => {
    renameRegion(hash, input.value);
    text.innerHTML = input.value;
  };

  renameDiv.appendChild(textDiv);
  renameDiv.appendChild(input);
  renameDiv.appendChild(button);

  return renameDiv;
}

function toggleDisplay(div, original) {
  console.log(div.style.display);
  div.style.display = div.style.display == "none" ? original : "none";
}

function validateForm() {}

myMap.on("click", onMapClick);

myMap.on("mousemove", e => {
  if (drawnPoints.length > 0) {
    previewLine.setLatLngs([drawnPoints[0], e.latlng]);
  }
  if (drawnPoints.length > 1) {
    connectBack.setLatLngs([e.latlng, drawnPoints[drawnPoints.length - 1]]);
  }
  mouseLatLng = e.latlng;
});
