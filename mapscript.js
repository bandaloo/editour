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
function hashBrown() {
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
  while (!found) {
    let regionName = "unnamed region " + hashBrown();
    if (!regions[regionName]) {
      found = true;
      // add region to the list of regions
      regions[regionName] = drawnPoints;
    }
  }

  // add poly to the map
  L.polygon(drawnPoints).addTo(myMap);

  // remove lines from map
  polyline.remove();
  connectBack.remove();
  previewLine.remove();

  drawnPoints = [];
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

function renameRegion(oldName, newName) {
  if (!regions[newName]) {
    regions[newName] = regions[oldName];
    delete regions[oldName];
  } else {
    alert(`region with name ${newName} already exists`);
  }
}

function addRegionDiv(hash, name) {
  let id = "id_" + hash;
  let div = document.createElement("div");
  //div.innerHTML = `<p>${hash}${name}</p>
  //<button class="button">test</button>`;
  let regionName = document.createElement("h3");
  regionName.innerHTML = "test";
  regionName.id = "name";
  div.appendChild(regionName);

  // TODO make delete button actually do something
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("button", "bluebutton");
  deleteButton.id = "deletebutton";
  deleteButton.innerHTML = "Delete";
  div.appendChild(deleteButton);

  div.id = hash;
  div.className = "sidebox";
  sideNav.appendChild(div);
}

function addRenameForm(hash) {
  let regionDiv = document.getElementById("id_" + hash);
  let changeDiv = document.createElement("div");

  let input = document.createElement("input");
  input.type = "text";
  input.name = "regiontext";
  input.className = "input";

  let button = document.createElement("button");
  button.classList.add("button");
  button.innerHTML = "Change";

  changeDiv.appendChild(input);
  changeDiv.appendChild(button);

  regionDiv.appendChild(changeDiv);
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
