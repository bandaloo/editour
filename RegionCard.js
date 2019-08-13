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
    this.regionName.id = "name";
    this.regionDiv.appendChild(this.regionName);

    this.buttonDiv = document.createElement("div");
    this.buttonDiv.classList.add("flex");

    this.deleteButton = document.createElement("button");
    this.deleteButton.classList.add("button", "fillwidth");
    this.deleteButton.id = "deletebutton";
    this.deleteButton.innerHTML = "Delete";
    this.buttonDiv.appendChild(this.deleteButton);

    this.infoButton = document.createElement("button");
    this.infoButton.classList.add("button", "orangebutton", "fillwidth");
    this.infoButton.id = "infobutton";
    this.infoButton.innerHTML = "Info";
    this.buttonDiv.appendChild(this.infoButton);

    // TODO why is this an empty object?????
    this.renameSubCard = new RenameSubCard(this);
    let testCard = new RenameSubCard(this);
    console.log("test card");
    console.log(testCard);
    console.log(this.renameSubCard);
    // TODO get rid of this next line
    testob = this.renameSubCard;
    let renameDiv = this.renameSubCard.renameDiv;
    renameDiv.display = "none";

    this.renameButton = document.createElement("button");
    this.renameButton.classList.add("button", "bluebutton", "fillwidth");
    this.renameButton.id = "renamebutton";
    this.renameButton.innerHTML = "Rename";
    this.renameButton.onclick = () => toggleDisplay(renameDiv, "flex");
    this.buttonDiv.appendChild(this.renameButton);

    this.regionDiv.appendChild(this.buttonDiv);
    this.regionDiv.appendChild(renameDiv);
  }
}
