class MediaSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    this.enclosingDiv.appendChild(this.audioFileInput);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }
}
