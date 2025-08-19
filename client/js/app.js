import { DomUtils } from './dom.js';

class TodoApp {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api/todos';
    this.todos = [];
    this.initialize();
  }

  initialize() {
    this.cacheDomElements();
    this.setupEventListeners();
    this.fetchTodos();
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
    this.dom.searchInput.addEventListener('input', () => this.fetchTodos());
    this.dom.applyFiltersBtn.addEventListener('click', () => this.fetchTodos());
    
    this.dom.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
  }

  async fetchTodos() {
    try {
      const params = new URLSearchParams({
        status: this.dom.statusFilter.value,
        search: this.dom.searchInput.value.toLowerCase(),
        time: this.dom.timeFilter.value
      });

      const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.todos = await response.json();
      this.render();
    } catch (error) {
      console.error('Error fetching todos:', error);
      DomUtils.showToast('Failed to load tasks. Please try again.', 'danger');
    }
  }

  async addTodo() {
    const text = this.dom.todoInput.value.trim();
    if (!text) {
      DomUtils.showToast('Please enter a task', 'warning');
      return;
    }

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.dom.todoInput.value = '';
      DomUtils.showToast('Task added successfully!', 'success');
      await this.fetchTodos(); 
    } catch (error) {
      console.error('Error adding todo:', error);
      DomUtils.showToast('Failed to add task. Please try again.', 'danger');
    }
  }

  async toggleTodoStatus(id) {
    try {
      const todo = this.todos.find(t => t._id === id);
      if (!todo) return;

      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: !todo.isCompleted })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await this.fetchTodos();
    } catch (error) {
      console.error('Error toggling todo status:', error);
      DomUtils.showToast('Failed to update task status.', 'danger');
    }
  }

  async editTodo(id, newText) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      DomUtils.showToast('Task updated successfully!', 'info');
      await this.fetchTodos(); 
    } catch (error) {
      console.error('Error editing todo:', error);
      DomUtils.showToast('Failed to update task.', 'danger');
    }
  }

  async deleteTodo(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      DomUtils.showToast('Task deleted successfully!', 'danger');
      await this.fetchTodos(); 
    } catch (error) {
      console.error('Error deleting todo:', error);
      DomUtils.showToast('Failed to delete task.', 'danger');
    }
  }

  async saveTodos() {
    try {
      DomUtils.showToast('Tasks are automatically saved to the database!', 'success');
    } catch (error) {
      console.error('Error saving todos:', error);
      DomUtils.showToast('Failed to save tasks.', 'danger');
    }
  }

  render() {
    this.dom.todoContainer.innerHTML = '';

    if (this.todos.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.className = 'list-group-item text-center text-muted';
      emptyMsg.textContent = 'No tasks found';
      this.dom.todoContainer.appendChild(emptyMsg);
      return;
    }

    this.todos.forEach(todo => {
      const todoElement = DomUtils.createTodoElement(
        {
          id: todo._id,
          text: todo.text,
          isChecked: todo.isCompleted,
          createdAt: todo.createdAt
        },
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