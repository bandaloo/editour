"use strict";

// a list of region objects
var regions = [];

// list of points, which are lists of length 2 and contain numbers
var drawnPoints = [];
var polyline;
var connectBack;

// an enum basically
const stateEnum = Object.freeze({
  // don't use 0 due to boolishness
  drawing: 1,
  selecting: 2
});

var state = stateEnum.selecting;

// stuff for regions
class Region {
  constructor(points = [], name = "") {
    this.points = points;
    this.name = name;
  }
}

// currently defaulted to Ritsumeikan University
var myMap = L.map("mapid").setView([34.982153, 135.963641], 17);

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
  } else if ((key = "E")) {
    endDraw();
  }
});

function startDraw() {
  console.log("start draw");
  state = stateEnum.drawing;
  polyline = L.polyline([], { color: "red" }).addTo(myMap);
  // TODO make connect back line be dotted
  connectBack = L.polyline([], { color: "blue", weight: 20 }).addTo(myMap);
}

function endDraw() {
  console.log("end draw");
  state = stateEnum.selecting;
  let region = new Region(drawnPoints, "change this name");
  L.polygon(drawnPoints).addTo(myMap);
  regions.push(region);
  polyline.remove();
  connectBack.remove();
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

myMap.on("click", onMapClick);
