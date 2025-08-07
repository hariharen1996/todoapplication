const todoItemsContainer = document.getElementById("todoItemsContainer");
const todoUserInput = document.getElementById("todoUserInput");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const addToast = document.getElementById("toast");
const deleteToast = document.getElementById("deleteToast");
const timeFilter = document.getElementById("timeFilter");
const statusFilter = document.getElementById("statusFilter");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");


const API_BASE_URL = "http://localhost:5000/api/todos";

function showToast(container, message, className) {
  const toastMessage = document.createElement("p");
  toastMessage.textContent = message;
  toastMessage.className = className;
  container.innerHTML = "";
  container.appendChild(toastMessage);
  setTimeout(() => {
    toastMessage.remove();
  }, 3000);
}

async function fetchTodos(timeFilter = "all", statusFilter = "all") {
  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.append("timeFilter", timeFilter);
    url.searchParams.append("statusFilter", statusFilter);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch todos");
    return await response.json();
  } catch (error) {
    console.error("Error fetching todos:", error);
    showToast(addToast, "Error loading todos", "error-message");
    return [];
  }
}

async function createTodo(todoText) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: todoText }),
    });
    
    if (!response.ok) throw new Error("Failed to create todo");
    return await response.json();
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
}

async function updateTodoStatus(todoId, isChecked) {
  try {
    const response = await fetch(`${API_BASE_URL}/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isChecked }),
    });
    
    if (!response.ok) throw new Error("Failed to update todo");
    return await response.json();
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
}

async function deleteTodo(todoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${todoId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) throw new Error("Failed to delete todo");
    return true;
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
}

async function renderTodoList() {
  const timeValue = timeFilter.value;
  const statusValue = statusFilter.value;
  
  const { data: todos } = await fetchTodos(timeValue, statusValue);
  todoItemsContainer.innerHTML = "";
  
  todos.forEach(todo => {
    createAndAppendTodo(todo);
  });
}

function createAndAppendTodo(todo) {
  const todoId = todo._id;
  const checkboxId = `check-${todoId}`;
  const labelId = `label-${todoId}`;

  const todoElement = document.createElement("li");
  todoElement.className = "todo-item-container d-flex flex-row";
  todoElement.id = `todo-${todoId}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxId;
  checkbox.checked = todo.isChecked;
  checkbox.className = "checkbox-input";
  checkbox.onclick = () => onTodoStatusChanged(todoId, checkboxId, labelId);

  const labelContainer = document.createElement("div");
  labelContainer.className = "label-container d-flex flex-row";

  const label = document.createElement("label");
  label.id = labelId;
  label.textContent = todo.name;
  label.className = "checkbox-label";
  label.setAttribute("for", checkboxId);
  if (todo.isChecked) label.classList.add("strike-text");

  const deleteContainer = document.createElement("div");
  deleteContainer.className = "delete-icon-container";

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "far fa-trash-alt delete-icon";
  deleteIcon.onclick = () => onDeleteTodo(todoId);

  const timeAgoSpan = document.createElement("span");
  timeAgoSpan.className = "time-ago";
  timeAgoSpan.textContent = getTimeAgo(new Date(todo.createdAt));

  deleteContainer.appendChild(deleteIcon);
  labelContainer.appendChild(label);
  labelContainer.appendChild(deleteContainer);
  labelContainer.appendChild(timeAgoSpan);

  todoElement.appendChild(checkbox);
  todoElement.appendChild(labelContainer);
  todoItemsContainer.appendChild(todoElement);
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

async function onTodoStatusChanged(todoId, checkboxId, labelId) {
  const checkbox = document.getElementById(checkboxId);
  const label = document.getElementById(labelId);
  
  try {
    await updateTodoStatus(todoId, checkbox.checked);
    label.classList.toggle("strike-text");
  } catch (error) {
    checkbox.checked = !checkbox.checked; 
    showToast(addToast, "Failed to update task", "error-message");
  }
}

async function onDeleteTodo(todoId) {
  try {
    await deleteTodo(todoId);
    showToast(deleteToast, "Task Deleted", "delete-message");
    await renderTodoList();
  } catch (error) {
    showToast(deleteToast, "Failed to delete task", "error-message");
  }
}

async function initializeApp() {
  addBtn.addEventListener("click", async () => {
    const inputValue = todoUserInput.value.trim();
    
    if (!inputValue) {
      showToast(addToast, "Please enter a task", "error-message");
      return;
    }

    try {
      await createTodo(inputValue);
      todoUserInput.value = "";
      showToast(addToast, "New Task Added", "add-message");
      await renderTodoList();
    } catch (error) {
      showToast(addToast, "Failed to add task", "error-message");
    }
  });

  applyFiltersBtn.addEventListener("click", renderTodoList);

  saveBtn.style.display = "none";

  await renderTodoList();
}


initializeApp();