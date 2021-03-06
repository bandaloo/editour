"use strict";

// last position of mouse on mouse move, important for drawing
var mouseLatLng;

/**
 * @typedef {Object} Coordinate - latitude and longitude position
 * @property {number} lat - latitude
 * @property {number} lng - longitude
 */
/**
 * @typedef {Object} Region
 * @property {Coordinate[]} points
 * @property {string} name
 * @property {string[]} [audio]
 * @property {string[]} [images]
 * @property {Object} poly
 * @property {RegionCard} [card]
 * @property {number} [id]
 */
/** @type{Region[]} */
var tourRegions = [];

// list of points, which are lists of length 2 and contain numbers
var drawnPoints = [];

// unique identifier for region (used to create unique form element name)
var lastId = 0;

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

function addRegion(regionPoints, name = "Unnamed Region", audio, images) {
  // audio and images are optional
  let polygon = Leaflet.polygon(regionPoints);
  const newRegion = {
    id: lastId,
    points: regionPoints,
    name: name,
    poly: polygon
  };

  lastId++; // increment so nothing else has the same id

  if (audio !== undefined) {
    newRegion.audio = audio;
  }

  if (images !== undefined) {
    newRegion.images = images;
  }

  polygon.on("click", e => {
    onPolyClick(e, newRegion);
  });

  addRegionDiv(newRegion);

  // adds polygon to map
  polygon.addTo(myMap);

  // adds the region data
  tourRegions.push(newRegion);

  // TODO once hash is removed add region as a typedef and return type
  return newRegion;
}

/**
 * Deals with drawing on the map with shift click
 * @param {Object} e
 */
function onMapClick(e) {
  console.log("clicked map at: " + e.latlng);
  if (e.originalEvent.shiftKey) {
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
 * Adds region div to the document and region data for easy reference
 * @param {Object} region
 */
function addRegionDiv(region) {
  let regionCard = new RegionCard(region);
  sideNav.appendChild(regionCard.regionDiv);
  region.card = regionCard;
}

myMap.on("click", onMapClick);

// popup moved around and used for pointing to region
const popup = Leaflet.popup();
// marker created when clicking on coordinate box
const marker = Leaflet.marker({ lat: 0, lng: 0 });

marker.on("dragstart", () => {
  if (marker.poly === popup.poly) {
    myMap.closePopup();
  }
});

marker.on("drag", () => {
  marker.points[marker.index] = marker.getLatLng();
  marker.poly.setLatLngs(marker.points);
  const point = marker.points[marker.index];
  marker.paragraph.innerHTML = InfoSubCard.makeCoordParagraphText(point);
  const prevCircle =
    marker.circleMarkers[mod(marker.index, marker.circleMarkers.length)];
  const nextCircle =
    marker.circleMarkers[mod(marker.index + 1, marker.circleMarkers.length)];
  const midCircle = marker.cornerMarkers[marker.index];
  prevCircle.setLatLng(
    calcMidPoint(
      point,
      marker.points[mod(marker.index - 1, marker.points.length)]
    )
  );
  nextCircle.setLatLng(
    calcMidPoint(
      point,
      marker.points[mod(marker.index + 1, marker.points.length)]
    )
  );
  midCircle.setLatLng(point);
});

/**
 * Brings up popup when clicking on region polygon on map
 * @param {Object} e
 * @param {Object} region
 */
function onPolyClick(e, region) {
  if (popup.poly === region.poly && !region.card.infoSubCard.isHidden()) {
    myMap.closePopup();
  } else {
    popup
      .setLatLng(e.latlng)
      .setContent(popupText(region))
      .openOn(myMap);
    popup.poly = region.poly;
  }
  region.card.infoSubCard.toggleCard();
  pulseDiv(region.card.regionDiv);
}

/**
 * Creates the inner HTML for the map popup
 * @param {Region} region
 * @returns {string}
 */
function popupText(region) {
  return "<b>" + region.name + "</b>" + "<br>" + popup.getLatLng();
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
  lastId = 0; // start counting from zero again
  marker.remove();
  myMap.closePopup();
  let metadata = JSON.parse(strMetadata);
  console.log(metadata);
  for (let i = 0; i < tourRegions.length; i++) {
    let region = tourRegions[i];
    // wipe out the map polygon
    region.poly.remove();
    // wipe out any circle markers
    region.card.infoSubCard.clearCircleMarkers();
    // wipe out the region card
    region.card.regionDiv.parentNode.removeChild(region.card.regionDiv);
    // delete region data from regions
  }
  empty(tourRegions);

  let newRegions = metadata.regions;
  console.log(newRegions);
  let allPoints = [];
  for (let i = 0; i < newRegions.length; i++) {
    const addedRegion = addRegion(
      newRegions[i].points,
      newRegions[i].name,
      newRegions[i].audio,
      newRegions[i].images
    );
    allPoints = allPoints.concat(newRegions[i].points);

    // fill in the textbox with the transcript in the media card
    addedRegion.card.mediaSubCard.transcriptArea.value =
      newRegions[i].transcript;
  }
  // TODO get rid of this magic number 320 (used in another place)
  myMap.flyToBounds(allPoints, { paddingTopLeft: [320, 0] });
}

function makeXButton() {
  let xButton = document.createElement("button");
  xButton.type = "button";
  xButton.classList.add("xbutton");
  xButton.innerHTML = "×";
  return xButton;
}

/**
 * Modulus that actually works for negative numbers
 * @param {number} a
 * @param {number} b
 */
function mod(a, b) {
  return (a + b) % b;
}

/**
 * Function to empty array without reassignment
 * @param {any[]} array
 */
function empty(array) {
  array.length = 0;
}

/**
 * @param {Coordinate} point1
 * @param {Coordinate} point2
 * @returns {Coordinate}
 */
function calcMidPoint(point1, point2) {
  const polyline = Leaflet.polyline([point1, point2]);
  polyline.addTo(myMap);
  const midPoint = polyline.getCenter();
  polyline.remove();
  return midPoint;
}

/**
 * Read the coordinate text box and jump there on the map
 */
function jumpFromInput() {
  const coordElem = /** @type {HTMLInputElement} */ (document.getElementById(
    "jump-text"
  ));
  // get rid of the commas
  const coordString = coordElem.value.replace(/,/, "");
  const coords = coordString.split(" ").map(str => parseInt(str));
  if (
    coords[0] >= -90 &&
    coords[0] <= 90 &&
    coords[1] >= -180 &&
    coords[1] <= 180
  ) {
    // should be a valid coordinate string
    myMap.panTo(coords);
  } else {
    // clear the text box (to show the default text again)
    coordElem.value = "";
    console.log("invalid coordinate inputted");
  }
}

document.getElementById("jump-button").addEventListener("click", jumpFromInput);

document.getElementById("jump-text").addEventListener("keypress", event => {
  if (event.keyCode === 13) {
    jumpFromInput();
  }
});

/**
 * Function to fill the jump box with places you can click and jump to
 * @param {{name: string, point: Coordinate}[]} places
 */
function populateJumpBox(places) {
  const jumpBox = document.getElementById("jump-container");
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const button = document.createElement("button");
    button.classList.add("button", "orangebutton", "outlinebutton");
    button.type = "button";
    button.innerHTML = place.name;
    button.onclick = () => {
      myMap.panTo(place.point);
    };
    jumpBox.appendChild(button);
  }
}

/**
 * Make the div blink and scroll to it
 * @param {HTMLDivElement} div
 */
function pulseDiv(div) {
  // TODO currently doesn't work for scrolling smoothly to interior elements
  div.scrollIntoView({ behavior: "smooth" });
  div.classList.toggle("coordpulse");
  setTimeout(() => div.classList.toggle("coordpulse"), 500);
}

populateJumpBox([
  { name: "Ritsumeikan", point: { lat: 34.982832, lng: 135.964555 } },
  { name: "Fushimi Inari", point: { lat: 34.967122, lng: 135.77257 } },
  { name: "Kinkakuji", point: { lat: 35.039312, lng: 135.729476 } },
  { name: "Injoji", point: { lat: 35.035181, lng: 135.740549 } },
  { name: "Kiyomizu", point: { lat: 34.994874, lng: 135.784948 } }
]);

requestTourList();

function filterInPlace(list, func) {
  // remove without reassignment with splice
  for (let i = 0; i < list.length; i++) {
    if (func(list[i])) {
      list.splice(i, 1);
    }
  }
}
