class RenameSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "flex");

    this.textBox = document.createElement("input");
    this.textBox.type = "text";
    this.textBox.classList.add("input", "fillwidth");

    // does this need to be a property?
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
    this.setToggleButton(superCard.renameButton, "Cancel Rename");

    // hide the card to start
    //this.toggleCard();
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
