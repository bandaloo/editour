class RenameSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "flex");
    console.log(this.originalDisplay);
    console.log("ENCLOSING DIV");
    console.log(this.enclosingDiv);
    //this.superCard = superCard;
    // TODO get rid of renameDiv in place of enclosingDiv
    //this.renameDiv = document.createElement("div");
    //this.enclosingDiv.classList.add("sidebox");

    this.textBox = document.createElement("input");
    this.textBox.type = "text";
    this.textBox.classList.add("input", "fillwidth");

    this.okayButton = document.createElement("button");
    this.okayButton.classList.add("button", "greenbutton");
    this.okayButton.innerHTML = "Okay";
    this.okayButton.onclick = () => {
      renameRegion(superCard.hash, this.textBox.value);
      superCard.regionName.innerHTML = this.textBox.value;
      this.toggleCard();
    };

    this.enclosingDiv.appendChild(this.textBox);
    this.enclosingDiv.appendChild(this.okayButton);

    // set associated button text to change
    this.setToggleButton(superCard.renameButton, "Cancel");

    // hide the card to start
    this.toggleCard();
  }

  renameRegion(hash, newName) {
    regions[hash].name = newName;
  }

  whenMadeHidden() {
    this.textBox.value = "";
  }

  whenMadeVisible() {
    console.log(this.superCard);
    this.textBox.value = regions[this.superCard.hash].name;
  }
}
