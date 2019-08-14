class InfoSubCard extends SubCard {
  constructor(superCard) {
    // TODO move this to a function since multiple sideboxes need to do this
    super();
    this.superCard = superCard;
    this.enclosingDiv = document.createElement("div");
    this.enclosingDiv.classList.add("sidebox");

    let points = regions[superCard.hash].points;
    console.log(points);

    for (let i = 0; i < points.length; i++) {
      let coordDiv = document.createElement("div");
      coordDiv.classList.add("sidebox");

      let p1 = document.createElement("p");
      p1.innerHTML = "lat: " + points[i][0];
      let p2 = document.createElement("p");
      p2.innerHTML = "lon: " + points[i][1];

      coordDiv.appendChild(p1);
      coordDiv.appendChild(p2);

      this.enclosingDiv.appendChild(coordDiv);
    }

    this.originalDisplay = "block";

    // set associated button text to change
    this.setToggleButton(superCard.infoButton, "Hide");

    // hide the card to start
    this.toggleCard();
  }
}
