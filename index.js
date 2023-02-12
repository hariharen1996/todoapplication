let slideContainer = document.getElementById("slideContainer");
let todoItemsContainer = document.getElementById("todoItemsContainer");
let todoUserInput = document.getElementById("todoUserInput");
let addBtn = document.getElementById("addBtn");
let saveBtn = document.getElementById("saveBtn");
let addToast = document.getElementById("toast");
let deleteToast = document.getElementById("deleteToast");
let localToast = document.getElementById("localToast");

let addSlide;
let deleteSlide;
let saveLocal;

let addTaskSlider = document.createElement("p");
addTaskSlider.textContent = "New Task Added";
addTaskSlider.classList.add("add-message");
addToast.appendChild(addTaskSlider);

let deleteTaskSlider = document.createElement("p");
deleteTaskSlider.textContent = "Task Deleted";
deleteTaskSlider.classList.add("delete-message");
deleteToast.appendChild(deleteTaskSlider);

let localTaskSlider = document.createElement("p");
localTaskSlider.textContent = "Task Saved";
localTaskSlider.classList.add("delete-message");
localToast.appendChild(localTaskSlider);

function getLocalStorageItems() {
  let getItems = localStorage.getItem("todoItems");
  let parsedItems = JSON.parse(getItems);
  if (parsedItems === null) {
    return [];
  } else {
    return parsedItems;
  }
}

let todoList = getLocalStorageItems();
let todoCount = todoList.length;

saveBtn.onclick = function () {
  localStorage.setItem("todoItems", JSON.stringify(todoList));

  clearTimeout(localTaskSlider);
  localToast.style.opacity = 1;
  localTaskSlider = setTimeout(function () {
    localToast.style.opacity = 0;
  }, 2000);
};

addBtn.onclick = function () {
  let inputValue = todoUserInput.value;

  if (todoUserInput.value === "") {
    alert("Enter your tasks");
    return;
  }

  todoCount = todoCount + 1;

  let newTasks = {
    name: inputValue,
    uniqueId: todoCount,
    isChecked: false,
  };
  todoList.push(newTasks);
  createAndAppendTodo(newTasks);
  todoUserInput.value = "";

  clearTimeout(addSlide);
  addToast.style.opacity = 1;
  addSlide = setTimeout(function () {
    addToast.style.opacity = 0;
  }, 2000);
};

function onTodoStatusChanged(checkboxId, labelId, todoId) {
  let checkboxElement = document.getElementById(checkboxId);
  let labelElement = document.getElementById(labelId);
  labelElement.classList.toggle("strike-text");

  let todoCheckObject = todoList.findIndex(function (item) {
    let checkId = "todo" + item.uniqueId;
    if (checkId === todoId) {
      return true;
    } else {
      return false;
    }
  });

  let checkBoxIndex = todoList[todoCheckObject];

  if (checkBoxIndex.isChecked === true) {
    checkBoxIndex.isChecked = false;
  } else {
    checkBoxIndex.isChecked = true;
  }
}

function onDeleteTodo(todoId) {
  let deleteTodoId = document.getElementById(todoId);
  todoItemsContainer.removeChild(deleteTodoId);

  let deleteElementIndex = todoList.findIndex(function (item) {
    let itemId = "todo" + item.uniqueId;
    if (itemId === todoId) {
      return true;
    } else {
      return false;
    }
  });

  todoList.splice(deleteElementIndex, 1);
  clearTimeout(deleteSlide);
  deleteToast.style.opacity = 1;
  deleteSlide = setTimeout(function () {
    deleteToast.style.opacity = 0;
  }, 2000);
}

function createAndAppendTodo(todo) {
  let todoId = "todo" + todo.uniqueId;
  let checkboxId = "check" + todo.uniqueId;
  let labelId = "label" + todo.uniqueId;

  let todoElement = document.createElement("li");
  todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
  todoElement.id = todoId;
  todoItemsContainer.appendChild(todoElement);

  let inputElement = document.createElement("input");
  inputElement.classList.add("checkbox-input");
  inputElement.type = "checkbox";
  inputElement.checked = todo.isChecked;
  inputElement.id = checkboxId;

  inputElement.onclick = function () {
    onTodoStatusChanged(checkboxId, labelId, todoId);
  };

  todoElement.appendChild(inputElement);

  let labelContainer = document.createElement("div");
  labelContainer.classList.add("label-container", "d-flex", "flex-row");
  todoElement.appendChild(labelContainer);

  let labelText = document.createElement("label");
  labelText.classList.add("checkbox-label");
  labelText.id = labelId;
  labelText.textContent = todo.name;
  labelText.setAttribute("for", checkboxId);

  if (todo.isChecked === true) {
    labelText.classList.add("strike-text");
  }

  labelContainer.appendChild(labelText);

  let deleteContainer = document.createElement("div");
  deleteContainer.classList.add("delete-icon-container");
  labelContainer.appendChild(deleteContainer);

  let deleteIcon = document.createElement("i");
  deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");

  deleteIcon.onclick = function () {
    onDeleteTodo(todoId);
  };

  deleteContainer.appendChild(deleteIcon);
}

for (let todo of todoList) {
  createAndAppendTodo(todo);
}
