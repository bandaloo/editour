class MediaSubCard extends SubCard {
  /**
   * Constructor for media card that will show audio and images when it is
   * rebuilding from a downloaded file
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    // setting up audio file input
    this.audioFileInput = document.createElement("input");
    this.audioFileInput.type = "file";
    this.audioFileInput.accept = "audio/*";

    // TODO check if these are needed
    this.audioFileInput.id = "audio_id_" + superCard.region.id;
    this.audioFileInput.name = "audio_name_" + superCard.region.id;

    let removeFuncs = this.makeInternalDiv(
      "Audio file",
      this.audioFileInput,
      superCard.region.audio
    );

    // clear the original tags when audio file input is updated
    this.audioFileInput.onchange = () => {
      for (let i = 0; i < removeFuncs.length; i++) {
        removeFuncs[i]();
      }
    };

    // setting up image file input
    this.imageFileInput = document.createElement("input");
    this.imageFileInput.type = "file";
    this.imageFileInput.accept = "image/*";
    this.imageFileInput.multiple = true;

    // TODO check if these are needed
    this.imageFileInput.id = "image_id_" + superCard.region.id;
    this.imageFileInput.name = "image_name_" + superCard.region.id;

    let transcriptFlex = document.createElement("div");
    transcriptFlex.classList.add("flex");

    let transcriptHeader = document.createElement("h3");
    transcriptHeader.innerHTML = "Transcript";

    this.transcriptArea = document.createElement("textarea");
    this.transcriptArea.classList.add("hundredwidth", "transcriptarea");
    this.transcriptArea.rows = 6;

    let transcriptBox = document.createElement("div");
    transcriptBox.classList.add("sidebox");

    transcriptBox.appendChild(transcriptHeader);
    transcriptFlex.appendChild(this.transcriptArea);
    transcriptBox.appendChild(transcriptFlex);

    // TODO test the refactoring of this
    this.makeInternalDiv(
      "Image files",
      this.imageFileInput,
      this.superCard.region.images
    );

    this.enclosingDiv.appendChild(transcriptBox);

    this.setToggleButton(superCard.mediaButton, "Hide Media");
  }

  /**
   * Makes internal file section div
   * @param {string} name
   * @param {HTMLInputElement} input
   * @param {string[]} [filenames] - list to create tags out of and remove from
   */
  makeInternalDiv(name, input, filenames) {
    let internalDiv = document.createElement("div");
    internalDiv.classList.add("sidebox");
    let nameHeader = document.createElement("h3");
    nameHeader.innerHTML = name;
    internalDiv.appendChild(nameHeader);
    internalDiv.appendChild(input);
    this.enclosingDiv.appendChild(internalDiv);

    let removeFuncs = [];
    // add the file names
    if (filenames !== undefined) {
      for (let i = 0; i < filenames.length; i++) {
        let filenameDiv = document.createElement("div");
        filenameDiv.classList.add("sidebox", "flex");
        let filenameText = document.createElement("p");
        filenameText.classList.add("fillwidth", "filename");
        filenameText.innerHTML = filenames[i];
        let xButton = makeXButton();
        // remove the file from the region data when x is clicked
        const clickFunc = () => {
          this.removeFile(filenames, filenames[i]);
          filenameDiv.parentNode.removeChild(filenameDiv);
        };

        xButton.onclick = clickFunc;

        filenameDiv.appendChild(filenameText);
        filenameDiv.appendChild(xButton);
        internalDiv.appendChild(filenameDiv);

        removeFuncs.push(clickFunc);
      }
    }
    return removeFuncs;
  }

  /**
   * Remove filename from list of filenames
   * @param {string[]} list
   * @param {string} filename
   */
  removeFile(list, filename) {
    filterInPlace(list, name => {
      return filename === name;
    });
  }
}
