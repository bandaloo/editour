// treat this class as abstract please
class SubCard {
  // TODO show and hide button with show and hide text
  // TODO can probably get rid of this constructor
  constructor(enclosingDiv, originalDisplay) {
    this.enclosingDiv = enclosingDiv;
    this.originalDisplay = originalDisplay;
  }

  setToggleButton(toggleButton, hideString) {
    this.toggleButton = hideString;
    this.hideString = hideString;
    this.showString = toggleButton.innerHTML;
    toggleButton.onclick = () => {
      this.toggleOtherCard(this);
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
    this.toggleOtherCard(this);
  }

  toggleOtherCard(card) {
    if (card.isHidden()) {
      card.whenMadeVisible();
    } else {
      card.whenMadeHidden();
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
