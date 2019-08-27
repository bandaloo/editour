"use strict";

// last position of mouse on mouse move, important for drawing
var mouseLatLng;

// a list of region objects
var regions = {};

// list of points, which are lists of length 2 and contain numbers
var drawnPoints = [];

// whether the user is holding shift
var shifting = false;

// div where all the region cards are added
const sideNav = document.getElementById("sidenavid");

// @ts-ignore
let Leaflet = L;

// temporarily shown lines used for drawing
var polyline = Leaflet.polyline([], { color: colorEnum.drawing });
var connectBack = Leaflet.polyline([], {
  color: colorEnum.drawing,
  dashArray: "4"
});
var previewLine = Leaflet.polyline([], {
  color: colorEnum.drawing,
  dashArray: "4",
  opacity: 0.5
});

// set the default state to selecting, not drawing
var state = stateEnum.selecting;

// increasing max zoom of the map causes it to freak out
var myMap = Leaflet.map("mapid", {
  center: [34.982153, 135.963641], //Ritsumeikan
  //center: [35.039282, 135.730327], // Kinkakuji
  zoom: 17,
  zoomControl: false, // prevent zoom control from being added
  doubleClickZoom: false // double click annoying when drawing shapes
});

// adding zoom control to correct spot
Leaflet.control
  .zoom({
    position: "topright"
  })
  .addTo(myMap);

// using tile layer from openstreetmap (doesn't require api key)
Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// set event listener for shortcuts
document.addEventListener("keydown", function(e) {
  let code = e.keyCode;
  //let key = String.fromCharCode(code);
  if (code === 16) {
    shifting = true;
  }
});

document.addEventListener("keyup", function(e) {
  let code = e.keyCode;
  //let key = String.fromCharCode(code);
  if (code === 16) {
    shifting = false;
  }
});

/**
 * super simple hash for regions
 */
function randomHash() {
  return Math.random()
    .toString(36)
    .substring(7);
}

/**
 * Begin drawing mode, allowing user to define region with clicks
 */
function startDraw() {
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

/**
 * Terminates drawn polygon, adding card and poly to map, and removes temporary
 * geometry that was used just for drawing
 */
function endDraw() {
  state = stateEnum.selecting;
  //drawnPoints.push([mouseLatLng.lat, mouseLatLng.lng]);
  drawnPoints.push(mouseLatLng);

  addRegion(drawnPoints);

  // remove lines from map
  polyline.remove();
  connectBack.remove();
  previewLine.remove();
  drawnPoints = [];
}

function addRegion(regionPoints, name, audio, images) {
  // audio and images are optional
  let found = false;

  let polygon = Leaflet.polygon(regionPoints);
  // handles coming up with same hash
  let hash, regionName;
  while (!found) {
    hash = randomHash();
    if (!regions[hash]) {
      found = true;
      if (name === undefined) {
        regionName = "unnamed region " + hash;
      } else {
        regionName = name;
      }
      // add region to the list of regions
      regions[hash] = {
        // TODO points is kind of redundant since poly stores these
        points: regionPoints,
        name: regionName,
        poly: polygon
      };

      if (audio !== undefined) {
        regions[hash].audio = audio;
      }
      if (images !== undefined) {
        regions[hash].images = images;
      }
    }
  }

  polygon.on("click", e => {
    onPolyClick(e, regions[hash]);
  });

  addRegionDiv(hash, regionName, audio, images);

  // adds polygon to map
  polygon.addTo(myMap);
}

/**
 * Deals with drawing on the map with shift click
 * @param {Object} e
 */
function onMapClick(e) {
  console.log("clicked map at: " + e.latlng);
  if (shifting) {
    if (state === stateEnum.drawing) {
      if (drawnPoints.length > 1) {
        endDraw();
      } else {
        return;
      }
    } else {
      startDraw();
    }
  }
  if (state === stateEnum.drawing) {
    let coord = e.latlng;
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

/**
 * Renames region in the regions object
 * @param {string} hash
 * @param {string} newName
 */
function renameRegion(hash, newName) {
  regions[hash].name = newName;
}

/**
 * Adds region div to the document and region data for easy reference
 * @param {string} hash
 * @param {string} name
 * @param {string[]} [audio]
 * @param {string[]} [images]
 */
function addRegionDiv(hash, name, audio, images) {
  let regionCard = new RegionCard(hash, name, audio, images);
  sideNav.appendChild(regionCard.regionDiv);
  regions[hash].card = regionCard;
}

myMap.on("click", onMapClick);

var popup = Leaflet.popup(); // popup moved around and used for stuff
var marker = Leaflet.marker({ lat: 0, lng: 0 }); // marker created when clicking on coordinate box

/**
 * Brings up popup when clicking on region polygon on map
 * @param {Object} e
 * @param {Object} region
 */
function onPolyClick(e, region) {
  popup
    .setLatLng(e.latlng)
    .setContent("<b>" + region.name + "</b>" + "<br>" + e.latlng)
    .openOn(myMap);
  popup.poly = region.poly;
}

myMap.on("mousemove", e => {
  if (drawnPoints.length > 0) {
    previewLine.setLatLngs([drawnPoints[0], e.latlng]);
  }
  if (drawnPoints.length > 1) {
    connectBack.setLatLngs([e.latlng, drawnPoints[drawnPoints.length - 1]]);
  }
  mouseLatLng = e.latlng;
});

/**
 * Wipes out the map and rebuilds from metadata
 * @param {string} strMetadata - metadata to be parsed
 */
function rebuild(strMetadata) {
  marker.remove();
  myMap.closePopup();
  let metadata = JSON.parse(strMetadata);
  console.log(metadata);
  for (let hash in regions) {
    let region = regions[hash];
    // wipe out the map polygon
    region.poly.remove();
    // wipe out the region card
    region.card.regionDiv.parentNode.removeChild(region.card.regionDiv);
    // delete region data from regions
    delete regions[hash];
  }
  let newRegions = metadata.regions;
  console.log(newRegions);
  for (let i = 0; i < newRegions.length; i++) {
    addRegion(
      newRegions[i].points,
      newRegions[i].name,
      newRegions[i].audio,
      newRegions[i].images
    );
  }
}

function makeXButton() {
  let xButton = document.createElement("button");
  xButton.type = "button";
  xButton.classList.add("xbutton");
  xButton.innerHTML = "×";
  return xButton;
}
