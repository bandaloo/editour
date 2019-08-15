// treat this class as abstract please
class SubCard {
  constructor(superCard, originalDisplay) {
    this.superCard = superCard;
    this.enclosingDiv = document.createElement("div");
    this.enclosingDiv.classList.add("sidebox");
    this.originalDisplay = originalDisplay;

    // can probably get rid of these and last two arguments
    //this.originalDisplay = originalDisplay;
  }

  setToggleButton(toggleButton, hideString) {
    this.toggleButton = toggleButton;
    this.showString = toggleButton.innerHTML;
    this.hideString = hideString;

    toggleButton.onclick = () => {
      this.toggleCard();
    };
  }

  isHidden() {
    return this.enclosingDiv.style.display == "none";
  }

  toggleHidden() {
    this.enclosingDiv.style.display =
      this.enclosingDiv.style.display == "none" ? this.originalDisplay : "none";
  }

  toggleCard() {
    this.toggleOtherCard(this, this.showString, this.hideString);
  }

  // TODO try to get rid of this function
  toggleOtherCard(card, showString, hideString) {
    if (card.isHidden()) {
      card.whenMadeVisible();
      this.toggleButton.innerHTML = hideString;
    } else {
      card.whenMadeHidden();
      this.toggleButton.innerHTML = showString;
    }
    card.toggleHidden();
  }

  addDiv(div) {
    div.appendChild(this.enclosingDiv);
  }

  // override these
  whenMadeVisible() {
    console.log("card made visible");
  }

  whenMadeHidden() {
    console.log("card made hidden");
  }
}
