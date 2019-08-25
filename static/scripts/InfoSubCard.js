class InfoSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    let points = regions[superCard.hash].points;

    for (let i = 0; i < points.length; i++) {
      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox", "internalbox");

      // create new p elements for latitude and longitude
      let p1 = document.createElement("p");
      p1.innerHTML = "lat: " + points[i].lat;
      let p2 = document.createElement("p");
      p2.innerHTML = "lon: " + points[i].lng;

      // add lat and lon elements to the coord div
      coordDiv.appendChild(p1);
      coordDiv.appendChild(p2);

      this.enclosingDiv.appendChild(coordDiv);
    }

    this.setToggleButton(superCard.infoButton, "Hide Info");
  }
}
