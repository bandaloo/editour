const form = document.getElementById("sideform");

const submitButton = document.getElementById("submitbutton");

/*
submitButton.onclick = () => {
  sendData(form);
};
*/

form.addEventListener("submit", event => {
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
  xhr.addEventListener("error", (err) => {
    console.error("Something went wrong :(");
    console.log(err);
  });

  // set up request
  xhr.open("POST", url + "/upload");
  xhr.send(fd);
};
