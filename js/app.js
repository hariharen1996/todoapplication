import { TodoStorage } from './storage.js';
import { DomUtils } from './dom.js';
import { Todo } from './todo.js';

class TodoApp {
  constructor() {
    this.todos = [];
    this.nextId = 1;
    this.initialize();
  }

  initialize() {
    this.cacheDomElements();
    this.setupEventListeners();
    this.loadTodos();
    this.render();
  }

  cacheDomElements() {
    this.dom = {
      todoInput: document.getElementById('todoUserInput'),
      addBtn: document.getElementById('addBtn'),
      saveBtn: document.getElementById('saveBtn'),
      searchInput: document.getElementById('searchInput'),
      timeFilter: document.getElementById('timeFilter'),
      statusFilter: document.getElementById('statusFilter'),
      applyFiltersBtn: document.getElementById('applyFiltersBtn'),
      todoContainer: document.getElementById('todoItemsContainer')
    };
  }

  setupEventListeners() {
    this.dom.addBtn.addEventListener('click', () => this.addTodo());
    this.dom.saveBtn.addEventListener('click', () => this.saveTodos());
    this.dom.searchInput.addEventListener('input', () => this.render());
    this.dom.applyFiltersBtn.addEventListener('click', () => this.render());
    

    this.dom.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
  }

  loadTodos() {
    const savedTodos = TodoStorage.getItems();
    this.todos = savedTodos.map(item => new Todo(
      item.id || item.uniqueId,
      item.text || item.name,  
      item.isChecked,
      item.createdAt
    ));
    
    if (this.todos.length > 0) {
      this.nextId = Math.max(...this.todos.map(todo => todo.id)) + 1;
    }
  }

  saveTodos() {
    TodoStorage.saveItems(this.todos);
    DomUtils.showToast('Tasks saved successfully!', 'success');
  }

  addTodo() {
    const text = this.dom.todoInput.value.trim();
    if (!text) {
      DomUtils.showToast('Please enter a task', 'warning');
      return;
    }

    const newTodo = new Todo(this.nextId++, text);
    this.todos.push(newTodo);
    this.dom.todoInput.value = '';
    DomUtils.showToast('Task added!', 'success');
    this.render();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    DomUtils.showToast('Task deleted', 'danger');
    this.render();
  }

  toggleTodoStatus(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.toggleStatus();
      this.render();
    }
  }

  editTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.updateText(newText);
      DomUtils.showToast('Task updated', 'info');
      this.render();
    }
  }

  getFilteredTodos() {
    const searchTerm = this.dom.searchInput.value.toLowerCase();
    const statusFilter = this.dom.statusFilter.value;
    const timeFilter = this.dom.timeFilter.value;
    const now = new Date();

    return this.todos.filter(todo => {
      if (!todo.text.toLowerCase().includes(searchTerm)) {
        return false;
      }

      if (statusFilter === 'completed' && !todo.isChecked) return false;
      if (statusFilter === 'incomplete' && todo.isChecked) return false;

      const createdDate = new Date(todo.createdAt);
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

      switch (timeFilter) {
        case 'today': return createdDate.toDateString() === now.toDateString();
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    });
  }

  render() {
    this.dom.todoContainer.innerHTML = '';

    const filteredTodos = this.getFilteredTodos();

    if (filteredTodos.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.className = 'list-group-item text-center text-muted';
      emptyMsg.textContent = 'No tasks found';
      this.dom.todoContainer.appendChild(emptyMsg);
      return;
    }

    filteredTodos.forEach(todo => {
      const todoElement = DomUtils.createTodoElement(
        todo,
        (id) => this.toggleTodoStatus(id),
        (id) => this.deleteTodo(id),
        (id, newText) => this.editTodo(id, newText)
      );
      this.dom.todoContainer.appendChild(todoElement);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});