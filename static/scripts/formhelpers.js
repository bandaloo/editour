"use strict";

const form = /** @type {HTMLFormElement} */ (document.getElementById(
  "sideform"
));
const submitButton = /** @type {HTMLButtonElement} */ (document.getElementById(
  "submitbutton"
));
const jsonTextField = /** @type {HTMLInputElement} */ (document.getElementById(
  "metadata"
));

// determines whether to post to /upload or /edit
var downloaded = false;
var currentTourName = "";

/**
 * Action for hitting the upload button (really happens on form submit)
 * @param {Event} event
 */
function hitUpload(event) {
  jsonTextField.value = JSON.stringify(makeFileRegionData());
  event.preventDefault();
  let uploadMessage = document.getElementById("upload-message");
  uploadMessage.style.color = colorEnum.waiting;
  uploadMessage.innerHTML = "Uploading...";
  currentTourName = /** @type {HTMLInputElement} */ (document.getElementById(
    "upload-text"
  )).value;
  sendData(form);
}

function hitDelete(event) {
  requestTourDeletion(
    /** @type {HTMLInputElement} */ (document.getElementById("delete-text"))
      .value
  );
}

form.addEventListener("submit", hitUpload);

/**
 * Sends data to one of the endpoints (either /edit or /upload)
 * @param {HTMLFormElement} form
 */
function sendData(form) {
  console.log("sending form");
  const xhr = new XMLHttpRequest();
  const arr = window.location.href.split("/");
  const url = arr[0] + "//" + arr[2];

  // Bind the FormData object and the form element
  const fd = new FormData(form);

  // uploaded tour
  xhr.addEventListener("load", event => {
    let uploadMsgElem = document.getElementById("upload-message");
    if (
      statusChanger(uploadMsgElem, xhr.status, event, 201, text => {
        uploadMsgElem.innerHTML += " " + text;
      })
    ) {
      const oldNameText = /** @type{HTMLInputElement} */ (document.getElementById(
        "old-name"
      ));
      oldNameText.value = processName(currentTourName);
      setZipMessage();
    }
  });

  xhr.addEventListener("error", () => {
    errorChanger(document.getElementById("upload-message"));
  });

  xhr.upload.addEventListener("progress", event => {
    const uploadMessage = document.getElementById("upload-message");
    console.log(progressText(event));
    uploadMessage.innerHTML = `Uploading...${progressText(event)}`;
  });

  // set up request (ternery for pointing to correct endpoint)
  xhr.open("POST", url + (downloaded ? "/edit" : "/upload"));
  xhr.send(fd);
}

/**
 * @typedef {Object} Coordinate - latitude and longitude position
 * @property {number} lat - latitude
 * @property {number} lng - longitude
 */
/**
 * @typedef {Object} RegionDatum - the metadata to describe a region
 * @property {string} name
 * @property {Coordinate[]} points
 * @property {string[]} audio
 * @property {string[]} images
 */
/**
 * @typedef {Object} RegionData - the metadata for the tour file
 * @property {RegionDatum[]} regions
 */
/**
 * Function for generating JSON data to associate files with regions
 * @return {RegionData}
 */
function makeFileRegionData() {
  /** @type {RegionData} */
  let data = { regions: [] };
  for (let hash in regions) {
    // real region to build a json region out of
    let realRegion = regions[hash];

    // json region to reflect the real region
    /** @type {RegionDatum} */
    let jsonRegion = {
      name: realRegion.name,
      points: realRegion.points,
      audio: realRegion.card
        .getAudioNames()
        .concat(realRegion.audio ? realRegion.audio : []),
      images: realRegion.card
        .getImageNames()
        .concat(realRegion.images ? realRegion.images : [])
    };

    // add the json region to json data
    data.regions.push(jsonRegion);
  }
  console.log(data);
  return data;
}

/**
 * Creates a url to send a request to
 * @param {string} endpointName
 * @param {string} [tourName]
 * @returns {string}
 */
function createEndpointString(endpointName, tourName = "") {
  const host = window.location.host;
  const scheme = window.location.href.split("/")[0];
  return `${scheme}//${host}/${endpointName}/${tourName}`;
}

/**
 * Request download of tour from server
 * @param {string} tourName
 */
function requestTour(tourName) {
  const xhr = new XMLHttpRequest();

  const str = createEndpointString("edit", tourName);
  /*
  const host = window.location.host;
  const scheme = window.location.href.split("/")[0];
  const str = `${scheme}//${host}/edit/${tourName}`;
  */

  xhr.open("GET", str);

  // downloaded tour
  xhr.addEventListener("load", event => {
    // set to download mode
    downloaded = true;
    const uploadText = /** @type {HTMLInputElement} */ (document.getElementById(
      "upload-text"
    ));
    const oldNameText = /** @type {HTMLInputElement} */ (document.getElementById(
      "old-name"
    ));
    //uploadText.readOnly = true;
    uploadText.value = currentTourName;
    oldNameText.value = processName(currentTourName);

    if (
      statusChanger(
        document.getElementById("download-message"),
        xhr.status,
        event,
        200,
        rebuild
      )
    ) {
      setZipMessage();
    }
  });

  xhr.addEventListener("error", () => {
    errorChanger(document.getElementById("download-message"));
  });

  xhr.addEventListener("progress", event => {
    const downloadMessage = document.getElementById("download-message");
    console.log(progressText(event));
    downloadMessage.innerHTML = `Downloading...${progressText(event)}`;
  });

  xhr.send();
}

function requestTourDeletion(tourName) {
  const xhr = new XMLHttpRequest();
  const str = createEndpointString("tours", tourName);

  xhr.open("DELETE", str);

  xhr.addEventListener("load", event => {
    // TODO change this
    console.log("got a delete response back");
  });

  xhr.send();
}

function requestTourList() {
  const xhr = new XMLHttpRequest();
  const str = createEndpointString("tours");

  xhr.open("GET", str);

  xhr.addEventListener("load", event => {
    // populate the tours container
    let parsedResponse = makeParsedResponse(event);
    let parsedResponseMessage = { files: [] };
    try {
      parsedResponseMessage = JSON.parse(parsedResponse.message);
    } catch (err) {
      console.error("could not parse the files list from the server");
    }

    const files = parsedResponseMessage.files;
    const toursContainer = document.getElementById("tours-container");
    for (let i = 0; i < files.length; i++) {
      const button = document.createElement("button");
      button.classList.add("button", "bluebutton", "outlinebutton");
      button.type = "button";
      button.innerHTML = files[i];
      button.onclick = () => {
        /** @type{HTMLInputElement} */ (document.getElementById(
          "download-text"
        )).value = files[i];
      };
      toursContainer.appendChild(button);
    }
  });

  xhr.send();
}

/**
 * Changes status of message area based on response from server
 * @param {HTMLElement} msgElem
 * @param {number} status
 * @param {ProgressEvent} event
 * @param {number} successCode
 * @param {Function} sCallback
 * @returns {boolean} whether it was a success or not
 */
function statusChanger(msgElem, status, event, successCode, sCallback) {
  let parsedResponse = makeParsedResponse(event);
  if (status !== successCode) {
    msgElem.style.color = colorEnum.failed;
    let message = parsedResponse.message;
    if (status === 404) {
      message = "404 not found";
    }
    msgElem.innerHTML = `There was a problem: ${message}`;
    return false;
  } else {
    msgElem.style.color = colorEnum.successful;
    msgElem.innerHTML = "Success!";
    console.log(parsedResponse);
    sCallback(parsedResponse.message);
    return true;
  }
}

/**
 * Returns a parsed response, handling error if cannot be parsed
 * @param {ProgressEvent} event
 * @return {{message: string}}
 */
function makeParsedResponse(event) {
  let responseText = /** @type {XMLHttpRequest} */ (event.target).responseText;
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (err) {
    console.error("could not parse json from response");
    parsedResponse = { message: "Unexpected response" };
  }
  return parsedResponse;
}

function errorChanger(msgElem) {
  msgElem.style.color = colorEnum.failed;
  msgElem.innerHTML = "Network error";
}

function hitDownload() {
  // currently edited map will be posted to edit instead
  const tourName = /** @type {HTMLInputElement} */ (document.getElementById(
    "download-text"
  )).value;
  const processedTourName = processName(tourName);
  console.log(processedTourName);

  let downloadMessage = document.getElementById("download-message");
  downloadMessage.style.color = colorEnum.waiting;
  downloadMessage.innerHTML = "Downloading...";
  currentTourName = tourName;
  requestTour(processedTourName);
}

function setZipMessage() {
  const zipMessage = document.getElementById("zip-message");
  let link = window.location.href + "tour/" + processName(currentTourName);
  zipMessage.innerHTML = `Get&nbsp;<a href="${link}">${processName(
    currentTourName
  )}.zip</a>`;
}

function processName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/\?\=&]/g, "");
}
// set an onclick for the download button
document.getElementById("download-button").onclick = hitDownload;

// set an onclick for the delete button
document.getElementById("delete-button").onclick = hitDelete;

form.addEventListener("keypress", event => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

document.getElementById("download-text").addEventListener("keypress", event => {
  if (event.keyCode === 13) {
    hitDownload();
  }
});

document.getElementById("upload-text").addEventListener("keypress", event => {
  if (event.keyCode === 13) {
    hitUpload(event);
  }
});

document.getElementById("delete-text").addEventListener("keypress", event => {
  if (event.keyCode === 13) {
    hitDelete();
  }
});

/**
 * @param {ProgressEvent} event
 */
function progressText(event) {
  if (event.lengthComputable && event.total > 0) {
    let loadFraction = event.loaded / event.total;
    let percentString = `${Math.round(loadFraction * 100)}%`;
    let byteString = `${event.loaded} of ${event.total} bytes`;
    return `${percentString}<br>${byteString}`;
  }
  return "computing...";
}
