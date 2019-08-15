class DeleteSubCard extends SubCard {
  constructor(superCard) {
    super(superCard, "block");

    let reallyDeleteButton = document.createElement("button");
    reallyDeleteButton.classList.add("button", "hundredwidth");
    reallyDeleteButton.innerHTML = "Really delete";

    this.enclosingDiv.appendChild(reallyDeleteButton);

    reallyDeleteButton.onclick = () => {
      this.deleteRegion();
    };

    this.setToggleButton(superCard.deleteButton, "Don't Delete!");
  }

  deleteRegion() {
    console.log(this);
    regions[this.superCard.hash].poly.remove();
    delete regions[this.superCard.hash];
    let div = this.superCard.regionDiv;
    div.parentNode.removeChild(div);
  }
}
