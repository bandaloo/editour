const form = document.getElementById("sideform");
const submitButton = document.getElementById("submitbutton");
const jsonTextField = document.getElementById("metadata");

/*
submitButton.onclick = () => {
  sendData(form);
};
*/

form.addEventListener("submit", event => {
  jsonTextField.value = makeFileRegionString();
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
    console.log(event.target.responseText);
    if (JSON.parse(event.target.responseText).status === 201) {
      // TODO show visually that the upload succeeded
      // document.getElementById("status").innerHTML = "complete";
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
  return data;
}

// TODO shouldn't need this once we change to lat lng coordinate objects
function listsToLatLngs(lists) {
  return lists.map(list => {
    return { lat: list[0], lng: list[1] };
  });
}
