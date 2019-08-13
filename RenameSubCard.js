class RenameSubCard {
  constructor(superCard) {
    this.superCard = superCard;
    // TODO change this so it is passed in a div object from above
    this.renameDiv = document.createElement("div");
    console.log(this.renameDiv);
    console.log(this.superCard);
    this.renameDiv.classList.add("flex", "sidebox");

    this.textBox = document.createElement("input");
    this.textBox.type = "text";
    this.textBox.name = "regiontext"; // TODO check if we need this
    this.textBox.classList.add("input", "fillwidth");

    this.okayButton = document.createElement("button");
    this.okayButton.classList.add("button", "greenbutton");
    this.okayButton.innerHTML = "Okay";
    this.okayButton.onclick = () => {
      renameRegion(superCard.hash, this.textBox.value);
      superCard.regionName.innerHTML = this.textBox.value;
    };

    this.renameDiv.appendChild(this.textBox);
    this.renameDiv.appendChild(this.okayButton);
  }

  renameRegion(hash, newName) {
    regions[hash].name = newName;
  }
}
