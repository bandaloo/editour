/** @abstract */
class SubCard {
  /**
   * @param {RegionCard} superCard
   * @param {string} originalDisplay - whether to restore to block or flex
   */
  constructor(superCard, originalDisplay) {
    this.superCard = superCard;
    this.enclosingDiv = document.createElement("div");
    this.enclosingDiv.classList.add("sidebox");
    this.originalDisplay = originalDisplay;
  }

  /**
   * Sets which button to hide and show the subcard
   * @param {HTMLButtonElement} toggleButton
   * @param {string} hideString
   */
  setToggleButton(toggleButton, hideString) {
    this.toggleButton = toggleButton;
    this.showString = toggleButton.innerHTML;
    this.hideString = hideString;

    toggleButton.onclick = () => {
      this.toggleCard();
    };

    // hide the card at the beginning, which also adds arrow
    this.toggleCard();
  }

  /**
   * Returns whether the card is hidden or not
   * @returns {boolean}
   */
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

  /**
   * Toggles a card to hide and show the subcard and augments button
   * @param {SubCard} card
   * @param {string} showString
   * @param {string} hideString
   */
  toggleOtherCard(card, showString, hideString) {
    if (card.isHidden()) {
      card.whenMadeVisible();
      this.toggleButton.innerHTML = "▼ " + hideString;
    } else {
      card.whenMadeHidden();
      this.toggleButton.innerHTML = "► " + showString;
    }
    card.toggleHidden();
  }

  /**
   * Adds the subcard to the enclosing div (the region div)
   * @param {HTMLDivElement} div
   */
  addDiv(div) {
    div.appendChild(this.enclosingDiv);
  }

  // override this function
  whenMadeVisible() {}

  // override this function
  whenMadeHidden() {}
}
