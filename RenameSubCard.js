class RenameSubCard extends SubCard {
  constructor(superCard) {
    super();
    this.superCard = superCard;
    // TODO get rid of renameDiv in place of enclosingDiv
    this.renameDiv = document.createElement("div");
    // might not even need to add flex if it starts hidden
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

    // setting stuff up for superclass
    this.enclosingDiv = this.renameDiv;
    this.original = "flex";
  }

  renameRegion(hash, newName) {
    regions[hash].name = newName;
  }

  // TODO might not even need this
  whenMadeHidden() {
    this.textBox.value = "";
  }

  whenMadeVisible() {
    console.log(this.superCard);
    this.textBox.value = regions[this.superCard.hash].name;
  }
}
