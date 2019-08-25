const form = document.getElementById("sideform");
const submitButton = document.getElementById("submitbutton");
const jsonTextField = /** @type {HTMLInputElement} */ (document.getElementById(
  "metadata"
));

// determines whether to post to /upload or /edit
var downloaded = false;

form.addEventListener("submit", event => {
  jsonTextField.value = JSON.stringify(makeFileRegionData());
  event.preventDefault();
  sendData(form);
});

const sendData = f => {
  console.log("sending form");
  const xhr = new XMLHttpRequest();
  const arr = window.location.href.split("/");
  const url = arr[0] + "//" + arr[2];

  // Bind the FormData object and the form element
  const fd = new FormData(f);

  // successful data submission
  // TODO change this to onload
  xhr.addEventListener("load", event => {
    let uploadMsgElem = document.getElementById("upload-message");
    statusChanger(uploadMsgElem, xhr.status, event, 201, text => {
      uploadMsgElem.innerHTML += " File " + text;
    });
  });

  // error
  xhr.addEventListener("error", err => {
    console.error("Something went wrong :(");
    console.log(err);
  });

  // set up request (ternery for pointing to correct endpoint)
  xhr.open("POST", url + (downloaded ? "/edit" : "/upload"));
  xhr.send(fd);
};

/**
 * Function for generating JSON data to associate files with regions
 * @return {Object}
 */
function makeFileRegionData() {
  let data = { regions: [] };
  for (let hash in regions) {
    // real region to build a json region out of
    let realRegion = regions[hash];

    // json region to reflect the real region
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

function requestTour(tourName) {
  const href = window.location.href;
  const xhr = new XMLHttpRequest();
  const str = `${href}edit/${tourName}`;
  console.log(str);

  xhr.open("GET", str);

  xhr.onload = event => {
    statusChanger(
      document.getElementById("download-message"),
      xhr.status,
      event,
      200,
      rebuild
    );
  };

  xhr.onerror = () => {
    alert("request failed");
  };

  xhr.send();
}

function statusChanger(msgElem, status, event, successCode, sCallback) {
  if (status === 404) {
    msgElem.style.color = colorEnum.failed;
    msgElem.innerHTML = "Server not found";
    // won't get a nice json response if it's a 404, so break out
    return;
  }
  let responseText = event.target.responseText;
  let parsedResponse = JSON.parse(responseText);
  if (status !== successCode) {
    msgElem.style.color = colorEnum.failed;
    msgElem.innerHTML = `There was a problem: ${parsedResponse.message}`;
  } else {
    msgElem.style.color = colorEnum.successful;
    msgElem.innerHTML = `Success!`;
    console.log(parsedResponse);
    sCallback(parsedResponse.message);
  }
}

// set an onclick for the download button
document.getElementById("download-button").onclick = () => {
  // currently edited map will be posted to edit instead
  downloaded = true;
  let tourName = /** @type {HTMLInputElement} */ (document.getElementById(
    "download-text"
  )).value;
  // TODO only change the box when the download worked

  let uploadText = /** @type {HTMLInputElement} */ (document.getElementById(
    "tour-name"
  ));
  // TODO get rid of this (for now renaming is not enabled)
  uploadText.readOnly = true;
  uploadText.value = tourName;
  requestTour(tourName);
};
