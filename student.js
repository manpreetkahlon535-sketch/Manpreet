const KEY = "studentPortalStudents";

let students = JSON.parse(localStorage.getItem(KEY) || "null");

if (!students) {
    students = [
        {
            id: 1, name: "Aditi Sharma",
            phone: "9876543210", email: "aditi@stu.com",
            gender: "Female", course: "B.Tech CSE",
            dob: "", status: "Active"
        },
        {
            id: 2, name: "Rohan Mehta",
            phone: "9876543211", email: "rohan@stu.com",
            gender: "Male", course: "B.Tech ECE",
            dob: "", status: "Active"
        },
        {
            id: 3, name: "Sneha Patel",
            phone: "9876543212", email: "sneha@stu.com",
            gender: "Female", course: "B.Sc CS",
            dob: "", status: "Active"
        },
        {
            id: 4, name: "Arjun Singh",
            phone: "9876543213", email: "arjun@stu.com",
            gender: "Male", course: "BCA",
            dob: "", status: "Active"
        },
        {
            id: 5, name: "Kabir Verma",
            phone: "9876543214", email: "kabir@stu.com",
            gender: "Male", course: "BBA",
            dob: "", status: "Active"
        }
    ];
    saveData();
}

let editId = null;

function saveData() {
    localStorage.setItem(KEY, JSON.stringify(students));
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[c]);
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    const titles = {
        dashboard: "Student Dashboard",
        add: "Add Student Form",
        students: "All Students",
        search: "Search Student",
        delete: "Delete Student"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    document.querySelectorAll(".sidebar button").forEach(b => {
        b.classList.remove("active");
    });

    const index = {
        dashboard: 0, add: 1, students: 2,
        search: 3, delete: 4
    }[page];

    document.querySelectorAll(".sidebar button")[index]
        .classList.add("active");

    if (page === "dashboard") renderDashboard();
    if (page === "students") renderStudents();
    if (page === "delete") renderDelete();
    if (page === "search") searchStudents();
}

function renderDashboard() {
    document.getElementById("total").textContent = students.length;

    document.getElementById("active").textContent =
        students.filter(s => s.status === "Active").length;

    document.getElementById("male").textContent =
        students.filter(s => s.gender === "Male").length;

    document.getElementById("female").textContent =
        students.filter(s => s.gender === "Female").length;

    document.getElementById("recentTable").innerHTML =
        [...students].slice(-5).reverse().map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.course)}</td>
                <td>${safe(s.email)}</td>
                <td><span class="status">${safe(s.status)}</span></td>
            </tr>
        `).join("");
}

document.getElementById("studentForm").addEventListener(
    "submit", function(event) {
        event.preventDefault();

        const student = {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            gender: document.getElementById("gender").value,
            course: document.getElementById("course").value,
            dob: document.getElementById("dob").value,
            status: "Active"
        };

        if (!student.name || !student.email ||
            !student.gender || !student.course) {
            alert("Please fill in all required fields.");
            return;
        }

        const duplicate = students.some(s =>
            s.email.toLowerCase() === student.email.toLowerCase()
            && s.id !== editId
        );

        if (duplicate) {
            alert("This email address is already registered.");
            return;
        }

        if (editId !== null) {
            const index = students.findIndex(s => s.id === editId);
            students[index] = { ...students[index], ...student };
            alert("Student updated successfully!");
        } else {
            const nextId = students.length
                ? Math.max(...students.map(s => s.id)) + 1
                : 1;

            students.push({ id: nextId, ...student });
            alert("Student added successfully!");
        }

        saveData();
        this.reset();
        editId = null;
        renderDashboard();
        showPage("students");
    }
);

function renderStudents() {
    const term = (
        document.getElementById("filter").value || ""
    ).toLowerCase();

    const list = students.filter(s =>
        [s.id, s.name, s.email, s.course, s.gender]
        .some(value => String(value).toLowerCase().includes(term))
    );

    document.getElementById("studentsTable").innerHTML =
        list.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.course)}</td>
                <td>${safe(s.email)}</td>
                <td>${safe(s.gender)}</td>
                <td>
                    <button class="edit-btn"
                        onclick="editStudent(${s.id})">Edit</button>
                    <button class="delete-btn"
                        onclick="deleteStudent(${s.id})">Delete</button>
                </td>
            </tr>
        `).join("");
}

function searchStudents() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const term = input.value.trim().toLowerCase();

    const results = term ? students.filter(s =>
        [s.id, s.name, s.phone, s.email, s.course, s.gender]
        .some(value => String(value ?? "").toLowerCase().includes(term))
    ) : [];

    document.getElementById("searchTable").innerHTML =
        results.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.phone)}</td>
                <td>${safe(s.email)}</td>
                <td>${safe(s.course)}</td>
                <td>${safe(s.gender)}</td>
            </tr>
        `).join("");

    document.getElementById("searchMessage").textContent =
        !term ? "Enter a search term to find students."
        : results.length + " matching student(s) found.";
}

function renderDelete() {
    document.getElementById("deleteTable").innerHTML =
        students.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${safe(s.name)}</td>
                <td>${safe(s.course)}</td>
                <td>${safe(s.email)}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteStudent(${s.id})">Delete</button>
                </td>
            </tr>
        `).join("");
}

function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    if (confirm("Delete " + student.name + "?")) {
        students = students.filter(s => s.id !== id);
        saveData();
        renderDashboard();
        renderStudents();
        renderDelete();
        searchStudents();
        alert("Student deleted successfully!");
    }
}

function editStudent(id) {
    const s = students.find(student => student.id === id);
    if (!s) return;

    editId = id;

    document.getElementById("name").value = s.name;
    document.getElementById("phone").value = s.phone;
    document.getElementById("email").value = s.email;
    document.getElementById("gender").value = s.gender;
    document.getElementById("course").value = s.course;
    document.getElementById("dob").value = s.dob || "";

    showPage("add");
}

renderDashboard();
renderStudents();
renderDelete();