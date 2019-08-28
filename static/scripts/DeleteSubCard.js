"use strict";

class DeleteSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    let reallyDeleteButton = document.createElement("button");
    reallyDeleteButton.classList.add("button", "hundredwidth");
    reallyDeleteButton.innerHTML = "Really Delete";

    this.enclosingDiv.appendChild(reallyDeleteButton);

    reallyDeleteButton.onclick = () => {
      this.deleteRegion();
    };

    this.setToggleButton(superCard.deleteButton, "Don't Delete!");
  }

  /**
   * Deletes the poly, the region card, and the region data, and closes popup
   */
  deleteRegion() {
    console.log(this);
    const poly = regions[this.superCard.hash].poly;
    if (poly === popup.poly) {
      myMap.closePopup();
    }
    if (poly === marker.poly) {
      marker.remove();
    }
    // delete the circle markers so they aren't left behind
    this.superCard.infoSubCard.clearCircleMarkers();
    regions[this.superCard.hash].poly.remove();
    delete regions[this.superCard.hash];
    let div = this.superCard.regionDiv;
    div.parentNode.removeChild(div);
  }
}
