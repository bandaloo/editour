class InfoSubCard extends SubCard {
  constructor(superCard) {
    // TODO move this to a function since multiple sideboxes need to do this
    super();
    this.superCard = superCard;
    this.enclosingDiv = document.createElement("div");
    this.enclosingDiv.classList.add("sidebox");

    let testDiv = document.createElement("div");
    testDiv.classList.add("sidebox");
    let p1 = document.createElement("p");
    p1.innerHTML = "123456789.12345";
    let p2 = document.createElement("p");
    p2.innerHTML = "123456789.12345";

    testDiv.appendChild(p1);
    testDiv.appendChild(p2);
    // TODO remove this next line
    sideNav.appendChild(testDiv);
  }
}
