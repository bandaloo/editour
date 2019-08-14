let testob;
class RegionCard {
  // TODO figure out what doesn't need to be a property
  constructor(hash, name = "unnamed region") {
    //let id = "id_" + hash;
    this.hash = hash;
    this.regionDiv = document.createElement("div");
    //this.regionDiv.id = id;
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

    this.renameSubCard = new RenameSubCard(this);
    let renameDiv = this.renameSubCard.renameDiv;
    testob = this.renameSubCard;
    renameDiv.display = "none";

    this.renameButton = document.createElement("button");
    this.renameButton.classList.add("button", "bluebutton", "fillwidth");
    this.renameButton.innerHTML = "Rename";
    //this.renameButton.onclick = () => toggleDisplay(renameDiv, "flex");
    this.renameButton.onclick = () => {
      this.renameSubCard.toggleCard();
    };
    this.buttonDiv.appendChild(this.renameButton);

    this.regionDiv.appendChild(this.buttonDiv);
    this.regionDiv.appendChild(renameDiv);

    // set onclick event to zoom to bounds of region
    this.regionDiv.onclick = () =>
      // padding is because sidebar covers map
      myMap.flyToBounds(regions[hash].points, { paddingTopLeft: [300, 0] });
  }
}
