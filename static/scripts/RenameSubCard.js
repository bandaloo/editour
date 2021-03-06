class RenameSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "flex");

    this.textBox = document.createElement("input");
    this.textBox.type = "text";
    this.textBox.classList.add("text", "fillwidth");

    let okayButton = document.createElement("button");
    okayButton.type = "button";
    okayButton.classList.add("button", "greenbutton");
    okayButton.innerHTML = "Okay";

    const rename = () => {
      superCard.region.name = this.textBox.value;
      superCard.regionName.innerHTML = this.textBox.value;
      this.toggleCard();
      if (popup.poly === superCard.region.poly) {
        popup.setContent(popupText(superCard.region));
      }
    };

    this.textBox.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        rename();
      }
    });

    okayButton.onclick = rename;

    this.enclosingDiv.appendChild(this.textBox);
    this.enclosingDiv.appendChild(okayButton);

    this.setToggleButton(superCard.renameButton, "Cancel Rename");
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
    this.textBox.value = this.superCard.region.name;
  }
}
