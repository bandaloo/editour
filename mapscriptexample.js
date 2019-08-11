"use strict";

var regions = [];

// currently defaulted to Ritsumeikan University
var mymap = L.map("mapid").setView([34.982153, 135.963641], 17);

// mapbox tile layer (requires API key but shouldn't be a problem)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

// example marker
var marker = L.marker([34.982153, 135.963641]).addTo(mymap);

// example circle
var circle = L.circle([34.982153, 135.963641], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 30
}).addTo(mymap);

// example polygon
var polygon = L.polygon([
  [34.982153, 135.963641],
  [34.982153 + 0.001, 135.963641],
  [34.982153, 135.963641 + 0.001]
]).addTo(mymap);

// example popups (this should be useful for region names)
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// example of event and subscribing function
function onMapClick(e) {
  alert("You clicked the map at " + e.latlng);
}
var popup = L.popup();

function betterOnMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(mymap);
}

mymap.on("click", betterOnMapClick);
