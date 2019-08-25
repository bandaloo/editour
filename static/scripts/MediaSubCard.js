class MediaSubCard extends SubCard {
  /**
   * Constructor for media card that will show audio and video when it is
   * rebuilding from a downloaded file
   * @param {Object} superCard
   * @param {string[]} [audio]
   * @param {string[]} [images]
   */
  constructor(superCard, audio, images) {
    super(superCard, "block");

    // setting up audio file input
    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    // TODO check if these are needed
    this.audioFileInput.id = "audio_id_" + superCard.hash;
    this.audioFileInput.name = "audio_name_" + superCard.hash;

    this.makeInternalDiv("Audio file", this.audioFileInput, audio);

    // setting up image file input
    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";
    this.imageFileInput.multiple = true;

    // TODO check if these are needed
    this.imageFileInput.id = "image_id_" + superCard.hash;
    this.imageFileInput.name = "image_name_" + superCard.hash;

    this.makeInternalDiv("Image files", this.imageFileInput, images);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }

  /**
   * Makes internal file section div
   * @param {string} name
   * @param {string} input
   * @param {string[]} [filenames]
   */
  makeInternalDiv(name, input, filenames) {
    let internalDiv = document.createElement("div");
    internalDiv.classList.add("sidebox", "internalbox");
    let nameHeader = document.createElement("h3");
    nameHeader.innerHTML = name;
    internalDiv.appendChild(nameHeader);
    internalDiv.appendChild(input);
    this.enclosingDiv.appendChild(internalDiv);

    // add the file names
    if (filenames !== undefined) {
      for (let i = 0; i < filenames.length; i++) {
        let filenameDiv = document.createElement("div");
        filenameDiv.classList.add("sidebox", "flex");
        let filenameText = document.createElement("p");
        filenameText.classList.add("fillwidth", "filename");
        filenameText.innerHTML = filenames[i];
        // TODO add logic to button
        let xButton = document.createElement("button");
        xButton.type = "button";
        xButton.classList.add("xbutton");
        xButton.innerHTML = "×";
        filenameDiv.appendChild(filenameText);
        filenameDiv.appendChild(xButton);
        internalDiv.appendChild(filenameDiv);
      }
    }
  }
}
