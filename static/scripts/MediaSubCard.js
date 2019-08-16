class MediaSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    // setting up audio file input
    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    this.audioFileInput.id = "audio_id_" + superCard.hash;
    this.audioFileInput.name = "audio_name_" + superCard.hash;

    // setting up image file input
    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";

    this.imageFileInput.id = "image_id_" + superCard.hash;
    this.imageFileInput.name = "image_name_" + superCard.hash;
    this.imageFileInput.multiple = true;

    // adding file inputs to the documenht
    this.enclosingDiv.appendChild(this.audioFileInput);
    this.enclosingDiv.appendChild(this.imageFileInput);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }
}
