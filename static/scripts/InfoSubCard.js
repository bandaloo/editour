class InfoSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    let points = regions[superCard.hash].points;

    for (let i = 0; i < points.length; i++) {
      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox", "internalbox");

      // create new p elements for latitude and longitude
      let p1 = document.createElement("p");
      p1.innerHTML = "lat: " + points[i][0];
      let p2 = document.createElement("p");
      p2.innerHTML = "lon: " + points[i][1];

      // add lat and lon elements to the coord div
      coordDiv.appendChild(p1);
      coordDiv.appendChild(p2);

      this.enclosingDiv.appendChild(coordDiv);
    }

    this.setToggleButton(superCard.infoButton, "Hide Info");
  }
}
