const todoItemsContainer = document.getElementById("todoItemsContainer");
const todoUserInput = document.getElementById("todoUserInput");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const addToast = document.getElementById("toast");
const deleteToast = document.getElementById("deleteToast");
const localToast = document.getElementById("localToast");

const timeFilter = document.getElementById("timeFilter");
const statusFilter = document.getElementById("statusFilter");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");

let todoList = getLocalStorageItems();
let todoCount = todoList.length;

function renderTodoList(list) {
  todoItemsContainer.innerHTML = "";
  list.forEach(createAndAppendTodo);
}

function showToast(container, message, className) {
  const toastMessage = document.createElement("p");
  toastMessage.textContent = message;
  toastMessage.className = className;
  container.innerHTML = "";
  container.appendChild(toastMessage);
}


function getLocalStorageItems() {
  const items = localStorage.getItem("todoItems");
  return items ? JSON.parse(items) : [];
}

saveBtn.onclick = function () {
  localStorage.setItem("todoItems", JSON.stringify(todoList));
  showToast(localToast, "Task Saved", "local-message");
};

addBtn.onclick = function () {
  const inputValue = todoUserInput.value.trim();

  if (inputValue === "") {
    alert("Enter your tasks");
    return;
  }

  todoCount += 1;
  const newTask = {
    name: inputValue,
    uniqueId: todoCount,
    isChecked: false,
    createdAt: Date.now(),
  };

  todoList.push(newTask);
  todoUserInput.value = "";

  showToast(addToast, "New Task Added", "add-message");

  renderTodoList(todoList);
};

function onTodoStatusChanged(checkboxId, labelId, todoId) {
  const checkbox = document.getElementById(checkboxId);
  const label = document.getElementById(labelId);
  label.classList.toggle("strike-text");

  const index = todoList.findIndex((item) => "todo" + item.uniqueId === todoId);
  if (index !== -1) {
    todoList[index].isChecked = checkbox.checked;
  }
}

function onDeleteTodo(todoId) {
  const index = todoList.findIndex((item) => "todo" + item.uniqueId === todoId);
  if (index !== -1) {
    todoList.splice(index, 1);
    showToast(deleteToast, "Task Deleted", "delete-message");
  }
  renderTodoList(todoList);
}

function createAndAppendTodo(todo) {
  const todoId = "todo" + todo.uniqueId;
  const checkboxId = "check" + todo.uniqueId;
  const labelId = "label" + todo.uniqueId;

  const todoElement = document.createElement("li");
  todoElement.className = "todo-item-container d-flex flex-row";
  todoElement.id = todoId;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxId;
  checkbox.checked = todo.isChecked;
  checkbox.className = "checkbox-input";
  checkbox.onclick = () => onTodoStatusChanged(checkboxId, labelId, todoId);

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

  deleteContainer.appendChild(deleteIcon);
  labelContainer.appendChild(label);
  labelContainer.appendChild(deleteContainer);

  const timeAgoSpan = document.createElement("span");
  timeAgoSpan.className = "time-ago";
  timeAgoSpan.id = "timeAgo" + todo.uniqueId;
  timeAgoSpan.style.marginLeft = "12px";
  timeAgoSpan.style.color = "#718096";
  timeAgoSpan.style.fontSize = "14px";
  timeAgoSpan.textContent = getTimeAgo(todo.createdAt);

  labelContainer.appendChild(timeAgoSpan);

  todoElement.appendChild(checkbox);
  todoElement.appendChild(labelContainer);
  todoItemsContainer.appendChild(todoElement);
}

setInterval(() => {
  todoList.forEach((todo) => {
    const timeAgoElement = document.getElementById("timeAgo" + todo.uniqueId);
    if (timeAgoElement) {
      timeAgoElement.textContent = getTimeAgo(todo.createdAt);
    }
  });
}, 60000);

function getTimeAgo(time) {
  const now = Date.now();
  const diff = now - time;

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


applyFiltersBtn.onclick = function () {
  const timeValue = timeFilter.value;
  const statusValue = statusFilter.value;
  const now = Date.now();

  const filteredTodos = todoList.filter((todo) => {
    let time = false;
    if (timeValue === "all") {
      time = true;
    } else if (timeValue === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      time = todo.createdAt >= startOfDay.getTime();
    } else if (timeValue === "week") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      time = todo.createdAt >= weekAgo;
    } else if (timeValue === "month") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      time = todo.createdAt >= monthAgo;
    }

    let status = false;
    if (statusValue === "all") {
      status = true;
    } else if (statusValue === "completed") {
      status = todo.isChecked === true;
    } else if (statusValue === "incomplete") {
      status = todo.isChecked === false;
    }

    return time && status;
  });

  renderTodoList(filteredTodos);
};


renderTodoList(todoList);
