class MediaSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    // setting up audio file input
    let audioHeader = document.createElement("h4");
    audioHeader.innerHTML = "Upload audio file";

    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    this.audioFileInput.id = "audio_id_" + superCard.hash;
    this.audioFileInput.name = "audio_name_" + superCard.hash;

    // setting up image file input
    let imageHeader = document.createElement("h4");
    imageHeader.innerHTML = "Upload image files";

    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";

    this.imageFileInput.id = "image_id_" + superCard.hash;
    this.imageFileInput.name = "image_name_" + superCard.hash;
    this.imageFileInput.multiple = true;

    // adding file inputs to the documenht
    this.enclosingDiv.appendChild(audioHeader);
    this.enclosingDiv.appendChild(this.audioFileInput);
    this.enclosingDiv.appendChild(imageHeader);
    this.enclosingDiv.appendChild(this.imageFileInput);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }
}
