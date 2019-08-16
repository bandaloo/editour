class MediaSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    // id and name are potentially useful for the form
    this.audioFileInput.id = "id_" + superCard.hash;
    this.audioFileInput.name = "name_" + superCard.hash;

    this.enclosingDiv.appendChild(this.audioFileInput);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }
}
