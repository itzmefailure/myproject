// 1. Security Check & Unhide Body
if (sessionStorage.getItem('adminToken') !== 'verified') {
    window.location.href = 'login.html'; 
} else {
    // YE LINE ZAROORI HAI: Ye blank screen ko hatakar dashboard dikhayegi
    document.body.classList.remove('hidden'); 
}

// ... baaki ka purana code niche rehne do (loadData, renderTable, etc.)
// 1. Security Check (Sirf Redirect karega agar login nahi hai)
if (sessionStorage.getItem('adminToken') !== 'verified') {
    console.log("No token found, redirecting to login...");
    window.location.href = 'login.html'; 
}

// Global Variables
let allData = { admissions: [], contacts: [] };
let currentTab = 'admissions';

// 2. Load Data from Server
async function loadData() {
    console.log("Attempting to fetch data from server...");
    try {
        const response = await fetch('http://localhost:5000/api/admin/data');
        if (!response.ok) throw new Error('Server response was not ok');
        
        allData = await response.json();
        console.log("Data loaded successfully:", allData);
        renderTable(); 
    } catch (err) {
        console.error("Fetch error:", err);
        alert("Server se data nahi mil raha! Check if server.js is running.");
    }
}

// 3. Render Table
function renderTable(dataToDisplay = allData) {
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('data-table');
    const countBox = document.getElementById('count-box');
    
    if (!tableBody || !tableHead) return; // Error handling
    
    tableBody.innerHTML = '';
    
    if (currentTab === 'admissions') {
        tableHead.innerHTML = '<th class="p-6">Name</th><th class="p-6">Stream</th><th class="p-6">Subject</th><th class="p-6">Date</th><th class="p-6">Action</th>';
        const list = dataToDisplay.admissions || [];
        countBox.innerText = list.length;
        
        list.forEach(item => {
            tableBody.innerHTML += `<tr>
                <td class="p-6 font-semibold">${item.full_name}<br><span class="text-xs text-zinc-500">${item.email}</span></td>
                <td class="p-6">${item.stream}</td>
                <td class="p-6">${item.subject}</td>
                <td class="p-6 text-xs text-zinc-500">${new Date(item.submittedAt).toLocaleDateString()}</td>
                <td class="p-6"><button onclick="deleteItem('admission','${item._id}')" class="text-red-500 hover:underline">Delete</button></td>
            </tr>`;
        });
    } else {
        tableHead.innerHTML = '<th class="p-6">Subject</th><th class="p-6">Message</th><th class="p-6">Date</th><th class="p-6">Action</th>';
        const list = dataToDisplay.contacts || [];
        countBox.innerText = list.length;

        list.forEach(item => {
            tableBody.innerHTML += `<tr>
                <td class="p-6 font-semibold">${item.contact_subject}</td>
                <td class="p-6 max-w-xs truncate text-zinc-400">${item.contact_message}</td>
                <td class="p-6 text-xs text-zinc-500">${new Date(item.submittedAt).toLocaleDateString()}</td>
                <td class="p-6"><button onclick="deleteItem('contact','${item._id}')" class="text-red-500 hover:underline">Delete</button></td>
            </tr>`;
        });
    }
}

// 4. Search Filter
function filterData() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = {
        admissions: allData.admissions.filter(i => i.full_name.toLowerCase().includes(query) || i.email.toLowerCase().includes(query)),
        contacts: allData.contacts.filter(i => i.contact_subject.toLowerCase().includes(query))
    };
    renderTable(filtered);
}

// 5. Tabs & Delete
// Is purane function ko naye se REPLACE karein
function switchTab(tab) {
    currentTab = tab;
    
    // Header title badalna
    document.getElementById('tab-title').innerText = 
        (tab === 'settings') ? 'Security Settings' : tab.charAt(0).toUpperCase() + tab.slice(1);
    
    // Saare main sections ko pakadna
    const tableView = document.querySelector('.glass-card.rounded-3xl'); 
    const settingsView = document.getElementById('settings-view');
    const searchBox = document.querySelector('.mb-10.flex.justify-end'); 

    // Toggle Logic
    if (tab === 'settings') {
        if(tableView) tableView.classList.add('hidden');
        if(searchBox) searchBox.classList.add('hidden');
        if(settingsView) settingsView.classList.remove('hidden');
    } else {
        if(tableView) tableView.classList.remove('hidden');
        if(searchBox) searchBox.classList.remove('hidden');
        if(settingsView) settingsView.classList.add('hidden');
        renderTable(); // Table refresh karna
    }
}

async function deleteItem(type, id) {
    if(!confirm("Delete this record?")) return;
    await fetch(`http://localhost:5000/api/admin/delete/${type}/${id}`, { method: 'DELETE' });
    loadData();
}

// Excel Export
function downloadCSV() {
    let csv = "data:text/csv;charset=utf-8,";
    csv += (currentTab === 'admissions') ? "Name,Email,Stream,Subject,Date\n" : "Subject,Message,Date\n";
    const list = currentTab === 'admissions' ? allData.admissions : allData.contacts;
    
    list.forEach(item => {
        csv += (currentTab === 'admissions') 
            ? `${item.full_name},${item.email},${item.stream},${item.subject},${item.submittedAt}\n`
            : `${item.contact_subject},${item.contact_message.replace(/,/g,' ')},${item.submittedAt}\n`;
    });

    window.open(encodeURI(csv));
}

// Initialize
loadData();
// Ise file ke end mein ADD karein
async function updatePassword() {
    const currentPassword = document.getElementById('current-pass').value;
    const newPassword = document.getElementById('new-pass').value;

    if (!newPassword || newPassword.length < 6) {
        alert("New password must be at least 6 characters long!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/admin/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();
        
        if (result.success) {
            alert("Success! Security Key Updated. Please login again.");
            sessionStorage.clear(); // Token delete karna
            window.location.href = 'login.html'; // Wapas login pe bhejna
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Update error:", err);
        alert("Server connection failed!");
    }
}