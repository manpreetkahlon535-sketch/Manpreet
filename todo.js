const STORAGE_KEY = "todoApplicationTasks";

const sampleTasks = [
    {
        id: 1,
        title: "Complete project demo",
        priority: "High",
        dueDate: "2025-10-10",
        description: "Finish and review the project demonstration.",
        completed: false
    },
    {
        id: 2,
        title: "Learn Docker",
        priority: "Medium",
        dueDate: "2025-10-12",
        description: "Learn the basics of Docker.",
        completed: false
    },
    {
        id: 3,
        title: "Prepare for interview",
        priority: "High",
        dueDate: "2025-10-15",
        description: "Review interview questions.",
        completed: false
    },
    {
        id: 4,
        title: "Read a book",
        priority: "Low",
        dueDate: "2025-10-20",
        description: "Read a few chapters.",
        completed: false
    },
    {
        id: 5,
        title: "Plan weekend trip",
        priority: "Low",
        dueDate: "2025-10-25",
        description: "Plan the weekend trip.",
        completed: false
    }
];

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === null ? [...sampleTasks] : JSON.parse(saved);
    } catch (error) {
        return [...sampleTasks];
    }
}

let tasks = loadTasks();
let editingId = null;

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    const titles = {
        tasks: "My Todos",
        add: editingId === null ? "Add New Task" : "Edit Task",
        completed: "Completed Tasks"
    };

    document.getElementById("pageTitle").textContent = titles[pageId];

    if (pageId === "tasks") renderTasks();
    if (pageId === "completed") renderCompleted();
}

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.page === "add") resetForm();
        showPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
        resetForm();
        showPage(button.dataset.goto);
    });
});

// Dashboard summary
function updateSummary() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("completedCount").textContent =
        tasks.filter(task => task.completed).length;
}

// Create task HTML
function createTaskHTML(task) {
    const completedClass = task.completed ? "completed-task" : "";

    return `
        <article class="task-row ${completedClass}">
            <input
                type="checkbox"
                class="task-check"
                data-action="toggle"
                data-id="${task.id}"
                aria-label="Mark task completed"
                ${task.completed ? "checked" : ""}
            >

            <div class="task-info">
                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${task.description ? `
                    <div class="task-description">
                        ${escapeHTML(task.description)}
                    </div>
                ` : ""}
            </div>

            <span class="priority ${task.priority}">
                ${escapeHTML(task.priority)}
            </span>

            <span class="task-date">
                Due: ${escapeHTML(task.dueDate)}
            </span>

            <div class="task-actions">
                <button
                    class="icon-button edit-button"
                    data-action="edit"
                    data-id="${task.id}"
                    title="Edit task"
                    aria-label="Edit task"
                >✎</button>

                <button
                    class="icon-button delete-button"
                    data-action="delete"
                    data-id="${task.id}"
                    title="Delete task"
                    aria-label="Delete task"
                >▣</button>
            </div>
        </article>
    `;
}

// Display all tasks
function renderTasks() {
    const filter = document.getElementById("taskFilter")
        .value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task =>
        [task.title, task.priority, task.description, task.dueDate]
            .some(value => String(value || "")
                .toLowerCase().includes(filter))
    );

    document.getElementById("taskList").innerHTML =
        filteredTasks.map(createTaskHTML).join("");

    document.getElementById("emptyTasks").classList.toggle(
        "hidden",
        filteredTasks.length > 0
    );

    updateSummary();
}

// Display completed tasks
function renderCompleted() {
    const completedTasks = tasks.filter(task => task.completed);

    document.getElementById("completedList").innerHTML =
        completedTasks.map(createTaskHTML).join("");

    document.getElementById("emptyCompleted").classList.toggle(
        "hidden",
        completedTasks.length > 0
    );

    updateSummary();
}

// Add a new task or update an existing task
document.getElementById("taskForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const title = document.getElementById("taskTitle")
            .value.trim();

        const priority = document.getElementById("priority").value;
        const dueDate = document.getElementById("dueDate").value;
        const description = document.getElementById("description")
            .value.trim();

        if (!title || !priority || !dueDate) {
            alert("Please fill in all required fields.");
            return;
        }

        if (editingId !== null) {
            const task = tasks.find(task => task.id === editingId);

            if (task) {
                task.title = title;
                task.priority = priority;
                task.dueDate = dueDate;
                task.description = description;
            }

            alert("Task updated successfully!");
        } else {
            const nextId = tasks.length
                ? Math.max(...tasks.map(task => task.id)) + 1
                : 1;

            tasks.push({
                id: nextId,
                title: title,
                priority: priority,
                dueDate: dueDate,
                description: description,
                completed: false
            });

            alert("Task added successfully!");
        }

        saveTasks();
        resetForm();
        showPage("tasks");
    }
);

// Reset form and cancel editing
function resetForm() {
    editingId = null;
    document.getElementById("taskForm").reset();

    document.getElementById("formHeading").textContent =
        "Add New Task";

    document.getElementById("saveButton").textContent =
        "Add Task";

    document.getElementById("cancelEdit").classList.add("hidden");

    document.getElementById("pageTitle").textContent = "Add New Task";
}

document.getElementById("taskForm").addEventListener(
    "reset",
    function() {
        editingId = null;

        document.getElementById("formHeading").textContent =
            "Add New Task";

        document.getElementById("saveButton").textContent =
            "Add Task";

        document.getElementById("cancelEdit").classList.add("hidden");
    }
);

document.getElementById("cancelEdit").addEventListener(
    "click",
    function() {
        resetForm();
        showPage("tasks");
    }
);

// Edit an existing task
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    editingId = id;

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("priority").value = task.priority;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("description").value =
        task.description || "";

    document.getElementById("formHeading").textContent =
        "Edit Task";

    document.getElementById("saveButton").textContent =
        "Update Task";

    document.getElementById("cancelEdit").classList.remove("hidden");

    showPage("add");
    document.getElementById("pageTitle").textContent = "Edit Task";
}

// Delete a task
function deleteTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        tasks = tasks.filter(task => task.id !== id);

        saveTasks();
        renderTasks();
        renderCompleted();

        alert("Task deleted successfully!");
    }
}

// Handle checkbox, edit, and delete buttons
document.addEventListener("click", function(event) {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "edit") {
        editTask(id);
    }

    if (action === "delete") {
        deleteTask(id);
    }
});

document.addEventListener("change", function(event) {
    if (event.target.dataset.action !== "toggle") return;

    const id = Number(event.target.dataset.id);
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = event.target.checked;

    saveTasks();
    renderTasks();
    renderCompleted();
});

// Search/filter tasks
document.getElementById("taskFilter").addEventListener(
    "input",
    renderTasks
);

// Initial display
renderTasks();
renderCompleted();
updateSummary();