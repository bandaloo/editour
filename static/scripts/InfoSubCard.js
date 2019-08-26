"use strict";

class InfoSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    let points = regions[superCard.hash].points;
    let poly = regions[superCard.hash].poly;

    /** @type {{index: number, button: HTMLButtonElement, div: HTMLElement}[]} */
    this.coordData = [];

    for (let i = 0; i < points.length; i++) {
      let xButton = makeXButton();

      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox", "coordbox", "flex");
      coordDiv.setAttribute("data-index", i.toString());

      // create new p elements for latitude and longitude
      const coordParagraph = document.createElement("p");
      const fLat = points[i].lat.toFixed(5);
      const fLng = points[i].lng.toFixed(5);
      coordParagraph.innerHTML = `latitude: ${fLat}<br>longitude: ${fLng}`;
      coordParagraph.classList.add("fillwidth");
      coordDiv.appendChild(coordParagraph);
      coordDiv.appendChild(xButton);

      coordDiv.addEventListener("click", () => {
        let index = parseInt(coordDiv.getAttribute("data-index"));
        console.log(coordDiv.getAttribute("data-index"));
        marker.setLatLng(points[index]);
        myMap.panTo(points[index]);
      });

      // deleting the point
      const clickFunc = event => {
        // TODO add check for deletion that's not just blocked by UI
        event.stopPropagation();
        event.preventDefault();

        let index = parseInt(coordDiv.getAttribute("data-index"));
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

      this.coordData.push({ index: i, div: coordDiv, button: xButton });

      xButton.onclick = clickFunc;
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
}
