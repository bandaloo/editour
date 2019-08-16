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
  data = {};
  for (var hash in regions) {
    let region = regions[hash];
    data[hash] = {};
    data[hash]["name"] = region.name;
    data[hash]["points"] = region.points;
    data[hash]["audio"] = region.card.getAudioNames();
    data[hash]["images"] = region.card.getImageNames();
  }
  return JSON.stringify(data);
}

// TODO check if we need this anymore
function isEmpty(obj) {
  return Object.entries(obj).length === 0 && obj.constructor === Object;
}

submitButton.onclick = () => {
  console.log("submit button clicked");
  if (!isEmpty(regions)) {
    form.submit();
  } else {
    alert("You must have at least one region to upload");
  }
};
