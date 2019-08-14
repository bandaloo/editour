let testob;
class RegionCard {
  // TODO figure out what doesn't need to be a property
  constructor(hash, name = "unnamed region") {
    this.hash = hash;

    this.regionDiv = document.createElement("div");
    this.regionDiv.className = "sidebox";

    this.regionName = document.createElement("h3");
    this.regionName.innerHTML = name;
    this.regionDiv.appendChild(this.regionName);

    this.buttonDiv = document.createElement("div");
    this.buttonDiv.classList.add("flex");

    this.deleteButton = document.createElement("button");
    this.deleteButton.classList.add("button", "fillwidth");
    this.deleteButton.innerHTML = "Delete";
    this.buttonDiv.appendChild(this.deleteButton);

    this.infoButton = document.createElement("button");
    this.infoButton.classList.add("button", "orangebutton", "fillwidth");
    this.infoButton.innerHTML = "Info";
    this.buttonDiv.appendChild(this.infoButton);

    this.renameButton = document.createElement("button");
    this.renameButton.classList.add("button", "bluebutton", "fillwidth");
    this.renameButton.innerHTML = "Rename";

    this.buttonDiv.appendChild(this.renameButton);

    // append region card divs
    this.regionDiv.appendChild(this.buttonDiv);

    // make and add subcard divs (no need for them to be properties)
    let renameSubCard = new RenameSubCard(this);
    renameSubCard.addDiv(this.regionDiv);

    let infoSubCard = new InfoSubCard(this);
    infoSubCard.addDiv(this.regionDiv);

    // set onclick event to zoom to bounds of region
    this.regionDiv.onclick = () =>
      // padding is because sidebar covers map
      myMap.flyToBounds(regions[hash].points, { paddingTopLeft: [300, 0] });
  }
}
