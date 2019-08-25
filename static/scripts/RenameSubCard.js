"use strict";

class RenameSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "flex");

    this.textBox = document.createElement("input");
    this.textBox.type = "text";
    this.textBox.classList.add("fillwidth");

    let okayButton = document.createElement("button");
    okayButton.type = "button";
    okayButton.classList.add("button", "greenbutton");
    okayButton.innerHTML = "Okay";
    okayButton.onclick = () => {
      renameRegion(superCard.hash, this.textBox.value);
      superCard.regionName.innerHTML = this.textBox.value;
      this.toggleCard();
    };

    this.enclosingDiv.appendChild(this.textBox);
    this.enclosingDiv.appendChild(okayButton);

    this.setToggleButton(superCard.renameButton, "Cancel Rename");
  }

  /**
   * Renames only the region data
   * @param {string} hash
   * @param {string} newName
   */
  renameRegion(hash, newName) {
    regions[hash].name = newName;
  }

  /**
   * Clears the textbox when card is hidden (shouldn't really matter)
   */
  whenMadeHidden() {
    this.textBox.value = "";
  }

  /**
   * Fills the textbox with the current name (useful if you just want to make a
   * small change)
   */
  whenMadeVisible() {
    console.log(this.superCard);
    this.textBox.value = regions[this.superCard.hash].name;
  }
}
