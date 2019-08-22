const form = document.getElementById("sideform");
const submitButton = document.getElementById("submitbutton");
const jsonTextField = document.getElementById("metadata");

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

  // set up request
  xhr.open("POST", url + "/upload");
  xhr.send(fd);
};

/**
 * Function for generating JSON data to associate files with regions
 * @return {string}
 */
function makeFileRegionString() {
  data = { regions: [] };
  for (var hash in regions) {
    // real region to build a json region out of
    let realRegion = regions[hash];

    // json region to reflect the real region
    let jsonRegion = {
      name: realRegion.name,
      points: listsToLatLngs(realRegion.points),
      audio: realRegion.card.getAudioNames(),
      images: realRegion.card.getImageNames()
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
