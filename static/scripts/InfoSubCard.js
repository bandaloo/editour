"use strict";

class InfoSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    let points = regions[superCard.hash].points;

    for (let i = 0; i < points.length; i++) {
      let xButton = makeXButton();

      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox", "coordbox", "flex");

      // create new p elements for latitude and longitude
      const coordParagraph = document.createElement("p");
      const fLat = points[i].lat.toFixed(5);
      const fLng = points[i].lng.toFixed(5);
      coordParagraph.innerHTML = `latitude: ${fLat}<br>longitude: ${fLng}`;
      coordParagraph.classList.add("fillwidth");
      coordDiv.appendChild(coordParagraph);
      coordDiv.appendChild(xButton);

      coordDiv.addEventListener("click", () => {
        //marker.remove();
        marker.setLatLng(points[i]);
        myMap.panTo(points[i]);
      });

      const clickFunc = () => {
        // TODO remove the point from the poly
        coordDiv.parentNode.removeChild(coordDiv);
      };

      xButton.onclick = clickFunc;
      this.enclosingDiv.appendChild(coordDiv);
    }

    this.setToggleButton(superCard.infoButton, "Hide Info");
  }
}
