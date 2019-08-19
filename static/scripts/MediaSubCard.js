class MediaSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    // setting up audio file input
    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    // TODO check if these are needed
    this.audioFileInput.id = "audio_id_" + superCard.hash;
    this.audioFileInput.name = "audio_name_" + superCard.hash;

    this.makeInternalDiv("Audio file", this.audioFileInput);

    // setting up image file input
    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";
    this.imageFileInput.multiple = true;

    // TODO check if these are needed
    this.imageFileInput.id = "image_id_" + superCard.hash;
    this.imageFileInput.name = "image_name_" + superCard.hash;

    this.makeInternalDiv("Image files", this.imageFileInput);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }

  makeInternalDiv(name, input) {
    let internalDiv = document.createElement("div");
    internalDiv.classList.add("sidebox", "internalbox");
    let nameHeader = document.createElement("h3");
    nameHeader.innerHTML = name;
    internalDiv.appendChild(nameHeader);
    internalDiv.appendChild(input);
    this.enclosingDiv.appendChild(internalDiv);
  }
}
