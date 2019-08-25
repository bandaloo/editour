const form = document.getElementById("sideform");
const submitButton = document.getElementById("submitbutton");
const jsonTextField = document.getElementById("metadata");

// determines whether to post to /upload or /edit
var downloaded = false;

form.addEventListener("submit", event => {
  jsonTextField.value = JSON.stringify(makeFileRegionString());
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
    let responseText = event.target.responseText;
    let parsedResponse = JSON.parse(responseText);
    const uploadMessageElem = document.getElementById("upload-message");
    if (parsedResponse.status === 201) {
      uploadMessageElem.style.color = colorEnum.uploadSuccessful;
      uploadMessageElem.innerHTML = "Uploaded successfully!";
    } else {
      // 400 for client error; 500 if it's a serverside error
      uploadMessageElem.style.color = colorEnum.uploadFailed;
      uploadMessageElem.innerHTML = `There was a problem: ${
        parsedResponse.message
      }`;
    }
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
function makeFileRegionString() {
  data = { regions: [] };
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

// TODO shouldn't need this once we change to lat lng coordinate objects
function listsToLatLngs(lists) {
  return lists.map(list => {
    return { lat: list[0], lng: list[1] };
  });
}

function requestTour(tourName) {
  const href = window.location.href;
  const xhr = new XMLHttpRequest();
  const str = `${href}edit/${tourName}`;
  console.log(str);

  xhr.open("GET", str);

  xhr.onload = event => {
    let responseText = event.target.responseText;
    let parsedResponse = JSON.parse(responseText);
    const downloadMessageElem = document.getElementById("download-message");
    if (xhr.status != 200) {
      console.log("there was an error");
      // TODO extract this code into function and refactor upload
      downloadMessageElem.style.color = colorEnum.uploadFailed;
      downloadMessageElem.innerHTML = `There was a problem: ${
        parsedResponse.message
      }`;
    } else {
      downloadMessageElem.style.color = colorEnum.uploadSuccessful;
      downloadMessageElem.innerHTML = "Downloaded successfully!";
      console.log(JSON.parse(parsedResponse.message));
      rebuild(JSON.parse(parsedResponse.message));
    }
  };

  xhr.onerror = () => {
    alert("request failed");
  };

  xhr.send();
}

// set an onclick for the download button
document.getElementById("download-button").onclick = () => {
  // currently edited map will be posted to edit instead
  downloaded = true;
  let tourName = document.getElementById("download-text").value;
  // TODO only change the box when the download worked
  let uploadText = document.getElementById("tour-name");
  uploadText.value = tourName;
  requestTour(tourName);
};
