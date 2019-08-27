"use strict";

class InfoSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    /** @type {Object} */
    this.circleMarkers = [];

    let points = regions[superCard.hash].points;
    let poly = regions[superCard.hash].poly;

    /**
     * @typedef {Object} CoordDatum
     * @property {number} index
     * @property {HTMLButtonElement} button
     * @property {HTMLDivElement} div
     * @property {HTMLParagraphElement} paragraph
     */
    /** @type {CoordDatum[]} */
    this.coordData = [];

    for (let i = 0; i < points.length; i++) {
      let xButton = makeXButton();

      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox", "coordbox", "flex");
      coordDiv.setAttribute("data-index", i.toString());

      // create new p elements for latitude and longitude
      const coordParagraph = document.createElement("p");
      coordParagraph.innerHTML = InfoSubCard.makeCoordParagraphText(points[i]);
      coordParagraph.classList.add("fillwidth");
      coordDiv.appendChild(coordParagraph);
      coordDiv.appendChild(xButton);

      // clicking on the coordinate
      coordDiv.addEventListener("click", () => {
        let index = parseInt(coordDiv.getAttribute("data-index"));
        marker.setLatLng(points[index]);
        // not problematic to add to a map to which control already belongs
        marker.addTo(myMap);
        // TODO check to see if this needs to be enabled every time
        marker.dragging.enable();
        marker.points = points;
        marker.poly = regions[superCard.hash].poly;
        marker.index = index;
        marker.circleMarkers = this.circleMarkers;
        marker.paragraph = coordParagraph;
        if (regions[superCard.hash].poly === popup.poly) {
          myMap.closePopup();
        }
        myMap.panTo(points[index]);
      });

      // clicking on the X button
      xButton.onclick = event => {
        // TODO add check for deletion that's not just prevented by UI
        event.stopPropagation();
        event.preventDefault();

        let index = parseInt(coordDiv.getAttribute("data-index"));

        // delete the marker if the point under it is being deleted
        if (marker.index === index) {
          marker.remove();
        }

        console.log(index);
        points.splice(index, 1); // remove points from the region data
        poly.setLatLngs(points); // change the points of the poly
        this.coordData.splice(index, 1); // cut this object out of coordData
        for (let j = 0; j < this.coordData.length; j++) {
          this.coordData[j].div.setAttribute("data-index", j.toString());
        }
        coordDiv.parentNode.removeChild(coordDiv);
        this.hideButtonsWhenTriangle();
      };
      this.coordData.push({
        index: i,
        div: coordDiv,
        button: xButton,
        paragraph: coordParagraph
      });
      this.enclosingDiv.appendChild(coordDiv);
    }

    this.hideButtonsWhenTriangle();
    this.setToggleButton(superCard.infoButton, "Hide Info");
  }

  hideButtonsWhenTriangle() {
    // length should not be less than 3
    if (this.coordData.length <= 3) {
      for (let j = 0; j < this.coordData.length; j++) {
        this.coordData[j].button.disabled = true;
      }
    }
  }

  whenMadeHidden() {
    for (let i = 0; i < this.circleMarkers.length; i++) {
      this.circleMarkers[i].remove();
    }
    empty(this.circleMarkers);
  }

  whenMadeVisible() {
    // create and show circle markers
    const points = regions[this.superCard.hash].points;
    for (let i = 0; i < points.length; i++) {
      const p = i === 0 ? points.length - 1 : i - 1;
      console.log(`${p}, ${i}`);
      const midPoint = calcMidPoint(points[p], points[i]);
      // TODO change html option from blank
      var circleDiv = Leaflet.divIcon({ className: "circle", html: "" });
      const circleMarker = Leaflet.marker(midPoint, { icon: circleDiv });
      circleMarker.addTo(myMap);
      this.circleMarkers.push(circleMarker);
    }
  }

  /**
   * Fills the coordinate tag in the info card with correct info
   * @param {{lat: number, lng: number}} point
   * @returns {string}
   */
  static makeCoordParagraphText(point) {
    const fLat = point.lat.toFixed(5);
    const fLng = point.lng.toFixed(5);
    return `latitude: ${fLat}<br>longitude: ${fLng}`;
  }
}
