class InfoSubCard extends SubCard {
  /**
   * @param {RegionCard} superCard
   */
  constructor(superCard) {
    super(superCard, "block");

    /** @type {Object[]} */
    this.circleMarkers = [];
    /** @type {Object[]} */
    this.cornerMarkers = [];

    /**
     * @typedef {Object} CoordDatum
     * @property {number} index
     * @property {HTMLButtonElement} button
     * @property {HTMLDivElement} div
     * @property {HTMLParagraphElement} paragraph
     */
    /** @type {CoordDatum[]} */
    this.coordData = [];

    for (let i = 0; i < regions[superCard.hash].points.length; i++) {
      this.enclosingDiv.appendChild(this.makeCoordDiv(i));
    }

    this.hideButtonsWhenTriangle();
    this.setToggleButton(superCard.infoButton, "Hide Points");
  }

  /**
   * Makes the the coord div and also adds info to the coord data list
   * @param {number} i
   */
  makeCoordDiv(i) {
    const poly = regions[this.superCard.hash].poly;
    const points = regions[this.superCard.hash].points;

    let xButton = makeXButton();

    let coordDiv = document.createElement("div");
    coordDiv.classList.add("sidebox", "coordbox", "flex", "coordpulse");
    coordDiv.classList.toggle("coordpulse");
    coordDiv.setAttribute("data-index", i.toString());

    // create new p elements for latitude and longitude
    const coordParagraph = document.createElement("p");
    coordParagraph.innerHTML = InfoSubCard.makeCoordParagraphText(points[i]);
    coordParagraph.classList.add("fillwidth", "clickthrough");
    coordDiv.appendChild(coordParagraph);
    coordDiv.appendChild(xButton);

    // clicking on the coordinate
    coordDiv.addEventListener("click", event => {
      console.log(event.target);
      const index = parseInt(
        /** @type {HTMLDivElement} */ (event.target).getAttribute("data-index")
      );
      this.startPointEdit(points, coordParagraph, index);
      console.log(coordDiv.getAttribute("data-index"));
      myMap.panTo(points[index]);
    });

    // clicking on the X button
    xButton.onclick = event => {
      // TODO add check for deletion that's not just prevented by UI
      event.stopPropagation();
      event.preventDefault();

      let index = parseInt(coordDiv.getAttribute("data-index"));

      // delete the marker if the point under it is being deleted
      if (marker.index === index) {
        marker.remove();
      }

      console.log(index);
      points.splice(index, 1); // remove points from the region data
      poly.setLatLngs(points); // change the points of the poly
      this.coordData.splice(index, 1); // cut this object out of coordData
      this.updateDataIndices();
      coordDiv.parentNode.removeChild(coordDiv);
      this.clearCircleMarkers();
      this.populateCircleMarkers();
      this.hideButtonsWhenTriangle();
    };

    //const index = parseInt(coordDiv.getAttribute("data-index"));
    this.coordData.splice(i, 0, {
      index: i, // TODO see if we even need this
      div: coordDiv,
      button: xButton,
      paragraph: coordParagraph
    });
    return coordDiv;
  }

  updateDataIndices() {
    for (let i = 0; i < this.coordData.length; i++) {
      this.coordData[i].div.setAttribute("data-index", i.toString());
    }
  }

  hideButtonsWhenTriangle() {
    // length should not be less than 3
    const disabledBool = this.coordData.length <= 3 ? true : false;
    for (let j = 0; j < this.coordData.length; j++) {
      this.coordData[j].button.disabled = disabledBool;
    }
  }

  clearCircleMarkers() {
    for (let i = 0; i < this.circleMarkers.length; i++) {
      // both should have the same length
      this.circleMarkers[i].remove();
      this.cornerMarkers[i].remove();
    }
    empty(this.circleMarkers);
    empty(this.cornerMarkers);
    marker.remove();
  }

  populateCircleMarkers() {
    // create and show circle markers
    const points = regions[this.superCard.hash].points;
    const poly = regions[this.superCard.hash].poly;
    for (let i = 0; i < points.length; i++) {
      // add edge circle markers
      const p = i === 0 ? points.length - 1 : i - 1;
      console.log(`${p}, ${i}`);
      // TODO change html option from blank
      const midPoint = calcMidPoint(points[p], points[i]);
      const circleDiv = Leaflet.divIcon({ className: "circle", html: "" });
      const circleMarker = Leaflet.marker(midPoint, { icon: circleDiv });
      // add an on click to the circle marker
      circleMarker.on("click", () => {
        // mid point could have changed since circle marker was created
        const newMidPoint = calcMidPoint(points[p], points[i]);
        console.log("click");
        this.insertPoint(newMidPoint, i);
        this.insertCoordDiv(newMidPoint, i);
        this.clearCircleMarkers();
        this.populateCircleMarkers();
      });

      circleMarker.addTo(myMap);
      this.circleMarkers.push(circleMarker);

      // add corner circle markers
      const cornerDiv = Leaflet.divIcon({ className: "cornercircle" });
      console.log(cornerDiv);
      //cornerDiv.classList.add("cornercircle");
      const cornerMarker = Leaflet.marker(points[i], {
        icon: cornerDiv,
        draggable: true
      });

      cornerMarker.on("click", () => {
        this.startPointEdit(points, this.coordData[i].paragraph, i);
        this.coordData[i].div.scrollIntoView();
        this.coordData[i].div.classList.toggle("coordpulse");
        setTimeout(
          () => this.coordData[i].div.classList.toggle("coordpulse"),
          500
        );
      });

      cornerMarker.on("dragstart", () => {
        if (poly === popup.poly) {
          myMap.closePopup();
        }
      });

      cornerMarker.on("drag", () => {
        console.log("drag");
        if (marker.poly === poly && marker.index === i) {
          marker.remove();
        }
        points[i] = cornerMarker.getLatLng();
        poly.setLatLngs(points);
        const paragraphText = InfoSubCard.makeCoordParagraphText(points[i]);
        this.coordData[i].paragraph.innerHTML = paragraphText;
        const prevCircle = this.circleMarkers[
          mod(i, this.circleMarkers.length)
        ];
        const nextCircle = this.circleMarkers[
          mod(i + 1, this.circleMarkers.length)
        ];
        const midCircle = this.cornerMarkers[i];
        prevCircle.setLatLng(
          calcMidPoint(points[i], points[mod(i - 1, points.length)])
        );
        nextCircle.setLatLng(
          calcMidPoint(points[i], points[mod(i + 1, points.length)])
        );
        midCircle.setLatLng(points[i]);
      });

      cornerMarker.addTo(myMap);
      this.cornerMarkers.push(cornerMarker);
    }
  }

  /**
   * Inserts a new point at the given index
   * @param {{lat: number, lng: number}} point
   * @param {number} index
   */
  insertPoint(point, index) {
    const poly = regions[this.superCard.hash].poly;
    const points = regions[this.superCard.hash].points;
    points.splice(index, 0, point);
    poly.setLatLngs(points);
  }

  /**
   * Inserts a new coordinate tag at the given index in the subcard
   * @param {{lat: number, lng: number}} point
   * @param {number} index
   */
  insertCoordDiv(point, index) {
    //parentElement.insertBefore(newElement, parentElement.children[2]);
    // TODO add to coord data
    console.log(index);
    console.log(this.enclosingDiv.children);
    this.enclosingDiv.insertBefore(
      this.makeCoordDiv(index),
      this.enclosingDiv.children[index]
    );
    this.updateDataIndices();
    this.hideButtonsWhenTriangle();
  }

  whenMadeHidden() {
    this.clearCircleMarkers();
  }

  whenMadeVisible() {
    this.populateCircleMarkers();
  }

  /**
   * Fills the coordinate tag in the info card with correct info
   * @param {{lat: number, lng: number}} point
   * @returns {string}
   */
  static makeCoordParagraphText(point) {
    const fLat = point.lat.toFixed(5);
    const fLng = point.lng.toFixed(5);
    return `latitude: ${fLat}<br>longitude: ${fLng}`;
  }

  /**
   * @param {{lat: number, lng: number}[]} points
   * @param {HTMLParagraphElement} coordParagraph
   * @param {number} index
   */
  startPointEdit(points, coordParagraph, index) {
    //let index = parseInt(coordDiv.getAttribute("data-index"));
    marker.setLatLng(points[index]);
    // not problematic to add to a map to which control already belongs
    marker.addTo(myMap);
    // TODO check to see if this needs to be enabled every time
    marker.dragging.enable();
    marker.points = points;
    marker.poly = regions[this.superCard.hash].poly;
    marker.index = index;
    marker.circleMarkers = this.circleMarkers;
    marker.cornerMarkers = this.cornerMarkers;
    marker.paragraph = coordParagraph;
    if (regions[this.superCard.hash].poly === popup.poly) {
      myMap.closePopup();
    }
    //myMap.panTo(points[index]);
  }
}
