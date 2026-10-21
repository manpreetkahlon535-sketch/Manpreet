
// ========================================
// EMPLOYEE MANAGEMENT SYSTEM - JAVASCRIPT
// ========================================

const API = "https://dummy.restapiexample.com/api/v1";

const $ = id => document.getElementById(id);

let employees = [];

// API REQUEST FUNCTION
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Accept": "application/json",
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {})
        }
    });

    if (!response.ok) {
        throw new Error("HTTP Error: " + response.status);
    }

    return response.json();
}

// FORMAT EMPLOYEE DATA
function normalizeEmployee(e) {
    return {
        id: e.id,
        name: e.employee_name ?? e.name ?? "",
        email: e.email ?? "",
        phone: e.phone ?? "",
        department: e.department ?? "",
        salary: Number(e.employee_salary ?? e.salary ?? 0),
        age: e.employee_age ?? e.age ?? "",
        joiningDate: e.joiningDate ?? ""
    };
}

// DISPLAY STATUS
function setStatus(message, type = "") {
    if (!$("status")) return;

    $("status").textContent = message;
    $("status").className = type;
}

// SAFE HTML OUTPUT
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// FORMAT SALARY
function formatSalary(salary) {
    return "₹" + Number(salary || 0).toLocaleString("en-IN");
}

// ========================================
// 1. GET ALL EMPLOYEES
// GET /employees
// ========================================

async function loadEmployees() {
    try {
        setStatus("Loading employees...");

        const response = await apiRequest(`${API}/employees`);

        employees = (Array.isArray(response.data)
            ? response.data
            : []).map(normalizeEmployee);

        displayEmployees();

        setStatus("Employees loaded successfully.", "success");

    } catch (error) {
        setStatus("Unable to load employees: " + error.message, "error");
        console.error(error);
    }
}

// DISPLAY EMPLOYEE TABLE
function displayEmployees() {
    if (!$("rows")) return;

    const query = ($("filter")?.value || "").toLowerCase().trim();

    const filtered = employees.filter(e =>
        [e.id, e.name, e.email, e.department].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        )
    );

    if (!filtered.length) {
        $("rows").innerHTML =
            '<tr><td colspan="6">No employees found.</td></tr>';
    } else {
        $("rows").innerHTML = filtered.map(e => `
            <tr>
                <td>${escapeHTML(e.id)}</td>
                <td>${escapeHTML(e.name)}</td>
                <td>${escapeHTML(e.email || "—")}</td>
                <td>${escapeHTML(e.department || "—")}</td>
                <td>${escapeHTML(formatSalary(e.salary))}</td>
                <td>
                    <button class="edit"
                        data-action="edit"
                        data-id="${escapeHTML(e.id)}">
                        Edit
                    </button>

                    <button class="delete"
                        data-action="delete"
                        data-id="${escapeHTML(e.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");
    }

    if ($("total")) {
        $("total").textContent = employees.length;
    }

    if ($("departments")) {
        $("departments").textContent =
            new Set(employees.map(e => e.department).filter(Boolean)).size;
    }

    if ($("average")) {
        const totalSalary = employees.reduce(
            (sum, e) => sum + e.salary, 0
        );

        $("average").textContent = formatSalary(
            employees.length ? totalSalary / employees.length : 0
        );
    }
}

// ========================================
// 2. CREATE EMPLOYEE
// POST /create
// ========================================

async function createEmployee(data) {
    return apiRequest(`${API}/create`, {
        method: "POST",
        body: JSON.stringify({
            name: data.name,
            salary: String(data.salary),
            age: Number(data.age || 30)
        })
    });
}

// ========================================
// 3. UPDATE EMPLOYEE
// PUT /update/:id
// ========================================

async function updateEmployee(id, data) {
    return apiRequest(
        `${API}/update/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify({
                name: data.name,
                salary: String(data.salary),
                age: Number(data.age || 30)
            })
        }
    );
}

// ========================================
// 4. GET EMPLOYEE BY ID
// GET /employee/:id
// ========================================

async function editEmployee(id) {
    try {
        let employee;

        try {
            const response = await apiRequest(
                `${API}/employee/${encodeURIComponent(id)}`
            );

            if (!response.data) {
                throw new Error("Employee not found.");
            }

            employee = normalizeEmployee(response.data);

        } catch (error) {
            employee = employees.find(
                e => String(e.id) === String(id)
            );

            if (!employee) throw error;
        }

        $("id").value = employee.id;
        $("name").value = employee.name;
        $("salary").value = employee.salary;
        $("age").value = employee.age || 30;

        if ($("email")) $("email").value = employee.email;
        if ($("phone")) $("phone").value = employee.phone;
        if ($("department")) {
            $("department").value = employee.department;
        }
        if ($("joiningDate")) {
            $("joiningDate").value = employee.joiningDate;
        }

        $("formTitle").textContent =
            "Update Employee - ID: " + employee.id;

        $("saveButton").textContent = "Update Employee";

        showView("form");

    } catch (error) {
        alert("Unable to get employee: " + error.message);
    }
}

// ========================================
// 5. DELETE EMPLOYEE
// DELETE /delete/:id
// ========================================

async function deleteEmployee(id) {
    if (!confirm("Delete employee with ID " + id + "?")) {
        return;
    }

    try {
        const response = await apiRequest(
            `${API}/delete/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        alert(response.message || "Delete request completed.");

        await loadEmployees();

    } catch (error) {
        alert("Delete failed: " + error.message);
    }
}

// ========================================
// ADD / UPDATE FORM SUBMISSION
// ========================================

if ($("employeeForm")) {
    $("employeeForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!this.reportValidity()) return;

        const id = $("id").value;

        const data = {
            name: $("name").value.trim(),
            salary: Number($("salary").value),
            age: Number($("age")?.value || 30),
            email: $("email")?.value.trim() || "",
            phone: $("phone")?.value.trim() || "",
            department: $("department")?.value || "",
            joiningDate: $("joiningDate")?.value || ""
        };

        $("saveButton").disabled = true;

        try {
            let response;

            if (id) {
                response = await updateEmployee(id, data);
            } else {
                response = await createEmployee(data);
            }

            alert(response.message ||
                (id ? "Employee updated!" : "Employee created!"));

            this.reset();
            $("id").value = "";
            showView("dashboard");
            await loadEmployees();

        } catch (error) {
            alert("Operation failed: " + error.message);
        } finally {
            $("saveButton").disabled = false;
        }
    });
}

// ========================================
// 6. SEARCH EMPLOYEE
// ========================================

async function searchEmployees(query) {
    query = query.trim().toLowerCase();

    if (!query) {
        $("results").innerHTML = "<p>Enter an employee ID or name.</p>";
        return;
    }

    let matches = employees.filter(e =>
        [e.id, e.name, e.email, e.department].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        )
    );

    if (/^\d+$/.test(query) &&
        !matches.some(e => String(e.id) === query)) {
        try {
            const response = await apiRequest(
                `${API}/employee/${encodeURIComponent(query)}`
            );

            if (response.data) {
                matches.push(normalizeEmployee(response.data));
            }
        } catch (error) {
            console.log("Employee not found by ID.");
        }
    }

    if (!matches.length) {
        $("results").innerHTML = "<p>No employee found.</p>";
        return;
    }

    $("results").innerHTML = matches.map(e => `
        <div class="result">
            <h3>${escapeHTML(e.name)}</h3>
            <p><b>ID:</b> ${escapeHTML(e.id)}</p>
            <p><b>Email:</b> ${escapeHTML(e.email || "—")}</p>
            <p><b>Department:</b> ${escapeHTML(e.department || "—")}</p>
            <p><b>Salary:</b> ${escapeHTML(formatSalary(e.salary))}</p>
            <p><b>Phone:</b> ${escapeHTML(e.phone || "—")}</p>
            <button class="edit" data-action="edit"
                data-id="${escapeHTML(e.id)}">Edit</button>
            <button class="delete" data-action="delete"
                data-id="${escapeHTML(e.id)}">Delete</button>
        </div>
    `).join("");
}

// ========================================
// 7. NAVIGATION
// ========================================

function showView(viewName) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.add("hidden");
    });

    if ($(viewName)) {
        $(viewName).classList.remove("hidden");
    }

    document.querySelectorAll("[data-view]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    if ($("pageTitle")) {
        $("pageTitle").textContent =
            viewName === "dashboard" ? "Employee List" :
            viewName === "form" ? "Add / Update Employee" :
            "Search Employee";
    }
}

// Sidebar buttons
document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
        const view = button.dataset.view;

        if (view === "form") {
            $("employeeForm")?.reset();
            $("id").value = "";
            $("formTitle").textContent = "Add New Employee";
            $("saveButton").textContent = "Save Employee";
        }

        showView(view);

        if (view === "dashboard") loadEmployees();
    });
});

// Add employee
if ($("addButton")) {
    $("addButton").addEventListener("click", () => {
        $("employeeForm")?.reset();
        $("id").value = "";
        $("formTitle").textContent = "Add New Employee";
        $("saveButton").textContent = "Save Employee";
        showView("form");
    });
}

// Cancel form
if ($("cancelButton")) {
    $("cancelButton").addEventListener("click", () => {
        $("employeeForm")?.reset();
        $("id").value = "";
        showView("dashboard");
    });
}

// Refresh
if ($("refresh")) {
    $("refresh").addEventListener("click", loadEmployees);
}

// Live table filter
if ($("filter")) {
    $("filter").addEventListener("input", displayEmployees);
}

// Table edit / delete buttons
if ($("rows")) {
    $("rows").addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.action === "edit") {
            editEmployee(id);
        }

        if (button.dataset.action === "delete") {
            deleteEmployee(id);
        }
    });
}

// Search form
if ($("searchForm")) {
    $("searchForm").addEventListener("submit", event => {
        event.preventDefault();
        searchEmployees($("query").value);
    });
}

// Initial API call
loadEmployees();