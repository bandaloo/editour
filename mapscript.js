"use strict";

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
  let regionCard = new RegionCard(hash, name);
  sideNav.appendChild(regionCard.regionDiv);
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
