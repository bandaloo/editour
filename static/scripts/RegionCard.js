class RegionCard {
  /**
   * @param {Region} region
   */
  constructor(region) {
    this.region = region;
    // id should just be an integer to uniquely identify region

    this.regionDiv = document.createElement("div");
    this.regionDiv.classList.add("sidebox", "coordpulse");
    this.regionDiv.classList.toggle("coordpulse");

    this.nameDiv = document.createElement("div");
    this.nameDiv.className = "flex";

    // div for buttons for moving regions up and down
    this.regionName = document.createElement("h3");
    this.regionName.classList.add("regionname", "fillwidth");
    this.regionName.innerHTML = region.name;

    this.arrowDivDown = document.createElement("div");
    this.arrowDivDown.classList.add("xbutton", "arrowbutton");
    this.arrowDivDown.innerHTML = "▼";

    this.arrowDivUp = document.createElement("div");
    this.arrowDivUp.classList.add("xbutton", "arrowbutton");
    this.arrowDivUp.innerHTML = "▲";

    this.nameDiv.appendChild(this.regionName);
    this.nameDiv.appendChild(this.arrowDivDown);
    this.nameDiv.appendChild(this.arrowDivUp);
    this.regionDiv.appendChild(this.nameDiv);

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
    this.infoButton.innerHTML = "Points";

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

    this.renameSubCard = new RenameSubCard(this);
    this.renameSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.mediaButton);

    this.mediaSubCard = new MediaSubCard(this);
    this.mediaSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.infoButton);

    this.infoSubCard = new InfoSubCard(this);
    this.infoSubCard.addDiv(this.regionDiv);

    this.regionDiv.appendChild(this.deleteButton);

    this.deleteSubCard = new DeleteSubCard(this);
    this.deleteSubCard.addDiv(this.regionDiv);

    // set onclick event to zoom to bounds of region
    this.regionName.onclick = () =>
      // padding is because sidebar covers map
      myMap.flyToBounds(region.points, { paddingTopLeft: [320, 0] });
  }

  getAudioNames() {
    return this.getNames(this.mediaSubCard.audioFileInput);
  }

  getImageNames() {
    return this.getNames(this.mediaSubCard.imageFileInput);
  }

  getNames(fileInput) {
    // would like to use map on FileList, but doesn't have Array.prototype in chain
    //return this.mediaSubCard.audioFileInput.files.map(file => file.name);
    let names = [];
    let files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
      names.push(files[i].name);
    }
    return names;
  }
}
