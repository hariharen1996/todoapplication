export class DomUtils {
  static showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast');
    toastContainer.innerHTML = '';

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
      </div>
    `;

    toastContainer.appendChild(toastEl);

    const closeBtn = toastEl.querySelector('.btn-close');
    closeBtn.onclick = () => toastEl.remove();

    setTimeout(() => {
      toastEl.remove();
    }, duration);
  }

  static createTodoElement(todo, onStatusChange, onDelete, onEdit) {
    const todoElement = document.createElement('li');
    todoElement.className = 'list-group-item d-flex justify-content-between align-items-center';
    todoElement.id = `todo-${todo.id}`;

    const leftContent = document.createElement('div');
    leftContent.className = 'd-flex align-items-center gap-2 flex-grow-1';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${todo.id}`;
    checkbox.className = 'form-check-input';
    checkbox.checked = todo.isChecked;
    checkbox.addEventListener('change', () => onStatusChange(todo.id));

    const label = document.createElement('label');
    label.setAttribute('for', `check-${todo.id}`);
    label.className = `form-check-label mb-0 flex-grow-1 ${todo.isChecked ? 'strike-text' : ''}`;
    label.textContent = todo.text;
    label.addEventListener('dblclick', () => this.enableEditMode(label, todo, onEdit));

    leftContent.appendChild(checkbox);
    leftContent.appendChild(label);

    const deleteBtn = document.createElement('i');
    deleteBtn.className = 'fas fa-trash-alt delete-icon cursor-pointer ms-3';
    deleteBtn.addEventListener('click', () => onDelete(todo.id));

    todoElement.appendChild(leftContent);
    todoElement.appendChild(deleteBtn);

    return todoElement;
  }

  static enableEditMode(labelElement, todo, onEdit) {
    const originalText = labelElement.textContent;
    labelElement.contentEditable = true;
    labelElement.focus();

    const finishEdit = () => {
      labelElement.contentEditable = false;
      const newText = labelElement.textContent.trim();
      
      if (!newText) {
        labelElement.textContent = originalText;
        DomUtils.showToast('Task cannot be empty!', 'warning');
        return;
      }

      if (newText !== originalText) {
        onEdit(todo.id, newText);
      }
    };

    labelElement.addEventListener('blur', finishEdit);
    labelElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEdit();
      }
    });
  }
}