const API_URL = "https://sps-api.ferhathamza17.workers.dev"; // Change this after deploying!

let currentUser = null;
let pendingSchedule = [];

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        currentUser = await res.json();
        document.getElementById('login-section').classList.add('hidden');
        if (currentUser.role === 'admin') {
            document.getElementById('admin-section').classList.remove('hidden');
            loadAdminReport();
        } else {
            document.getElementById('doctor-section').classList.remove('hidden');
            document.getElementById('doc-welcome').innerText = `Dr. ${currentUser.username} (${currentUser.specialty})`;
            document.getElementById('doc-active-status').checked = currentUser.is_active === 1;
        }
    } else {
        alert("Login failed");
    }
}

function logout() {
    location.reload();
}

// --- Admin Functions ---

async function createDoctor() {
    const username = document.getElementById('new-doc-name').value;
    const password = document.getElementById('new-doc-pass').value;
    const specialty = document.getElementById('new-doc-spec').value;

    await fetch(`${API_URL}/api/create-doctor`, {
        method: 'POST',
        body: JSON.stringify({ username, password, specialty })
    });
    alert("Doctor Account Created!");
}

async function loadAdminReport() {
    const res = await fetch(`${API_URL}/api/schedule`);
    const data = await res.json();
    
    let html = `<h1>Monthly Plan</h1><table><tr><th>Date</th><th>Doctor</th><th>Specialty</th><th>Type</th></tr>`;
    data.forEach(item => {
        html += `<tr>
            <td>${item.date}</td>
            <td>${item.username}</td>
            <td>${item.specialty}</td>
            <td>${item.type.toUpperCase()}</td>
        </tr>`;
    });
    html += `</table>`;
    document.getElementById('admin-report-table').innerHTML = html;
}

// --- Doctor Functions ---

function addDateToList() {
    const date = document.getElementById('schedule-date').value;
    const type = document.getElementById('schedule-type').value;
    if(!date) return;

    pendingSchedule.push({ date, type });
    renderScheduleList();
}

function renderScheduleList() {
    const list = document.getElementById('schedule-list');
    list.innerHTML = "";
    pendingSchedule.forEach((item, index) => {
        list.innerHTML += `<li>${item.date} - ${item.type} <button onclick="pendingSchedule.splice(${index},1);renderScheduleList()">Remove</button></li>`;
    });
}

async function saveDoctorSchedule() {
    const isActive = document.getElementById('doc-active-status').checked ? 1 : 0;
    
    await fetch(`${API_URL}/api/update-status`, {
        method: 'POST',
        body: JSON.stringify({
            doctor_id: currentUser.id,
            is_active: isActive,
            dates: pendingSchedule
        })
    });
    alert("Schedule and Status Saved!");
}
