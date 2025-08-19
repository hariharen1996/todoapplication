export class Todo {
  constructor(id, text, isChecked = false, createdAt = new Date().toISOString()) {
    this.id = id;
    this.text = text;
    this.isChecked = isChecked;
    this.createdAt = createdAt;
  }

  toggleStatus() {
    this.isChecked = !this.isChecked;
  }

  updateText(newText) {
    this.text = newText.trim();
  }
}