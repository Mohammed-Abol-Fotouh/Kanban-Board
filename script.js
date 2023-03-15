const board = document.getElementById("container");
const columns = [
	{
		id: 1,
		title: "Not Started",
	},
	{
		id: 2,
		title: "In Progress",
	},
	{
		id: 3,
		title: "Completed",
	},
];

let drag = null;

// Create Columns and render in page
columns.forEach((column) => {
	// Create main column
	const columnDiv = document.createElement("div");
	columnDiv.className = "column";
	columnDiv.id = column.id;

	// Create column title
	const columnTitle = document.createElement("h3");
	columnTitle.textContent = column.title;
	columnDiv.appendChild(columnTitle);

	// Create tasks lists
	const tasksList = document.createElement("ul");
	tasksList.className = "tasks";
	columnDiv.appendChild(tasksList);

	// create add buttons
	const addTaskBtn = document.createElement("button");
	addTaskBtn.className = "btn";
	addTaskBtn.textContent = "+ Add";
	columnDiv.appendChild(addTaskBtn);

	// evevt listener for buttons to Add A new task
	addTaskBtn.addEventListener("click", () => {
		const inputContainer = document.createElement("li");
		inputContainer.className = "input-container";
		inputContainer.draggable = true;
		inputContainer.innerHTML = `
		<input type='text' class='field' id='${column.title}-task' placeholder='Task'/>
		<ion-icon name="pencil-outline" class='icon edit'></ion-icon>
		<ion-icon name="trash-outline" class="icon remove"></ion-icon>
		`;
		tasksList.appendChild(inputContainer);
		taskHandlers();
	});

	board.appendChild(columnDiv);
});

// Handle added tasks and control events on it
function taskHandlers() {
	const tasks = [...document.querySelectorAll("li")];
	tasks.forEach((task) => {
		const input = task.querySelector("input");
		const editBtn = task.querySelector(".edit");
		const deleteBtn = task.querySelector(".remove");

		// Save the task
		const saveTask = () => {
			input.setAttribute("disabled", "");
			input.setAttribute("value", input.value);
			input.style.cursor = "move";
			task.setAttribute("dragable", "true");

			updateLocalStorage();
		};

		// Edit task
		const editTask = () => {
			input.disabled = false;
			input.focus();
			input.style.cursor = "auto";
			task.removeAttribute("draggable");

			updateLocalStorage();
		};

		// Delete task
		const deleteTask = () => {
			task.remove();

			updateLocalStorage();
		};

		// Event listneres
		input.addEventListener("focusout", () => {
			saveTask();
		});

		input.addEventListener("keypress", (e) => {
			if (e.key == "Enter") {
				saveTask();
			}
		});

		editBtn.addEventListener("click", editTask);

		deleteBtn.addEventListener("click", deleteTask);

		dragDropTasks(task);
	});
}

/*
*****************
// Drag and Drop
*****************
*/
const taskLists = [...document.querySelectorAll(".tasks")];

const dragDropTasks = (task) => {
	const dragStart = () => {
		drag = task;
		task.style.opacity = "0.5";
	};

	const dragEnd = () => {
		drag = null;
		task.style.opacity = "1";
		updateLocalStorage();
	};

	task.addEventListener("dragstart", dragStart);
	task.addEventListener("dragend", dragEnd);

	const lists = document.querySelectorAll("ul");
	lists.forEach((list) => {
		list.addEventListener("dragover", (e) => {
			e.preventDefault();
			list.style.backgroundColor = "#004b3c";
			list.style.padding = "1.2rem 0";
		});

		list.addEventListener("dragleave", (e) => {
			e.preventDefault();
			list.style.backgroundColor = "transparent";
			list.style.padding = "1rem 1rem 1rem 0";
		});

		list.addEventListener("drop", () => {
			list.appendChild(drag);
			list.style.backgroundColor = "transparent";
		});
	});

	// Drag and Drop on touch screens
	task.addEventListener("touchstart", (e) => {
		drag = task;
		task.style.opacity = "0.5";
		// [...e.changedTouches].forEach((touch) => {
		// 	console.log(touch.identifier);
		// 	task.id = touch.identifier;
		// });
	});

	const columnDiv = document.querySelectorAll(".column");
	task.addEventListener("touchmove", (e) => {
		e.preventDefault();
		[...e.changedTouches].forEach((touch) => {
			task.id = touch.identifier;
			columnDiv.forEach((column) => {
				column = column.querySelector(".tasks");
				if (column.offsetTop < touch.pageY) {
					column.style.background = "#004b3c";
				} else {
					column.style.background = "transparent";
				}
			});
		});
	});

	task.addEventListener("touchend", (e) => {
		task.style.opacity = "1";
		[...e.changedTouches].forEach((touch) => {
			task.id = touch.identifier;
			columnDiv.forEach((column) => {
				column = column.querySelector(".tasks");
				column.style.background = "transparent";
				if (column.offsetTop < touch.pageY && drag !== null) {
					column.appendChild(drag);
				}
			});
			drag = null;
		});
		// set Lists To Local Storage
		updateLocalStorage();
	});
};

/*
*****************
// Local Storage
*****************
*/
const updateLocalStorage = () => {
	let notStartedList = taskLists[0].innerHTML;
	let progressList = taskLists[1].innerHTML;
	let completedList = taskLists[2].innerHTML;
	localStorage.setItem("Not Started list", notStartedList);
	localStorage.setItem("In Progress List", progressList);
	localStorage.setItem("Completed List", completedList);
};

const getDataFromLocalStorage = () => {
	taskLists[0].innerHTML = localStorage.getItem("Not Started list");
	taskLists[1].innerHTML = localStorage.getItem("In Progress List");
	taskLists[2].innerHTML = localStorage.getItem("Completed List");
};

if (
	localStorage.getItem("Not Started list") ||
	localStorage.getItem("In Progress List") ||
	localStorage.getItem("Completed List")
) {
	getDataFromLocalStorage();
	taskHandlers();
}
