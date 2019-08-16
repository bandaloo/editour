class RegionCard {
  constructor(hash, name = "unnamed region") {
    this.hash = hash;

    this.regionDiv = document.createElement("div");
    this.regionDiv.className = "sidebox";

    this.regionName = document.createElement("h3");
    this.regionName.innerHTML = name;
    this.regionDiv.appendChild(this.regionName);

    this.deleteButton = document.createElement("button");
    this.deleteButton.type = "button";
    this.deleteButton.classList.add("button", "outlinebutton", "revealer");
    this.deleteButton.innerHTML = "Delete";

    this.mediaButton = document.createElement("button");
    this.mediaButton.type = "button";
    this.mediaButton.classList.add(
      "button",
      "greenbutton",
      "outlinebutton",
      "revealer"
    );
    this.mediaButton.innerHTML = "Media";

    this.infoButton = document.createElement("button");
    this.infoButton.type = "button";
    this.infoButton.classList.add(
      "button",
      "orangebutton",
      "outlinebutton",
      "revealer"
    );
    this.infoButton.innerHTML = "Info";

    this.renameButton = document.createElement("button");
    this.renameButton.type = "button";
    this.renameButton.classList.add(
      "button",
      "bluebutton",
      "outlinebutton",
      "revealer"
    );
    this.renameButton.innerHTML = "Rename";

    // make and add subcard divs with revealers on top
    this.regionDiv.appendChild(this.renameButton);

    let renameSubCard = new RenameSubCard(this);
    renameSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.mediaButton);

    let mediaSubCard = new MediaSubCard(this);
    mediaSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.infoButton);

    let infoSubCard = new InfoSubCard(this);
    infoSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.deleteButton);

    let deleteSubCard = new DeleteSubCard(this);
    deleteSubCard.addDiv(this.regionDiv);

    // set onclick event to zoom to bounds of region
    this.regionName.onclick = () =>
      // padding is because sidebar covers map
      myMap.flyToBounds(regions[hash].points, { paddingTopLeft: [320, 0] });
  }
}
