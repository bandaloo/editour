// treat this class as abstract please
class SubCard {
  // TODO show and hide button with show and hide text
  constructor(enclosingDiv, original) {
    this.enclosingDiv = enclosingDiv;
    this.original = original;
  }

  isHidden() {
    return this.enclosingDiv.style.display == "none";
  }

  toggleHidden() {
    this.enclosingDiv.style.display =
      this.enclosingDiv.style.display == "none" ? this.original : "none";
  }

  toggleCard() {
    if (this.isHidden()) {
      this.whenMadeVisible();
    } else {
      this.whenMadeHidden();
    }
    console.log(this);
    this.toggleHidden();
  }

  // override these
  whenMadeVisible() {
    console.log("card made visible");
  }

  whenMadeHidden() {
    console.log("card made hidden");
  }
}
