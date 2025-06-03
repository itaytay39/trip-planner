// Application State
let appState = {
    currentTab: 'routes',
    currentRoute: null,
    routes: [],
    budgetCategories: [],
    expenses: [],
    uploadedFiles: [],
    theme: 'light'
};

// Sample Data
const sampleData = {
    routes: [
        {
            id: 1,
            name: "מסלול בצפון",
            waypoints: [
                {id: 1, name: "תל אביב", lat: 32.0853, lng: 34.7818, notes: "נקודת התחלה"},
                {id: 2, name: "חיפה", lat: 32.7940, lng: 34.9896, notes: "עצירה לצהריים"},
                {id: 3, name: "עכו", lat: 32.9334, lng: 35.0896, notes: "ביקור בעיר העתיקה"}
            ],
            distance: 120,
            duration: "2 שעות"
        }
    ],
    budgetCategories: [
        {id: 1, name: "תחבורה", icon: "🚗", budget: 2000, spent: 1200, color: "#3498db"},
        {id: 2, name: "לינה", icon: "🏨", budget: 3000, spent: 2500, color: "#e74c3c"},
        {id: 3, name: "אוכל", icon: "🍽️", budget: 1500, spent: 800, color: "#f39c12"},
        {id: 4, name: "פעילויות", icon: "🎯", budget: 1000, spent: 300, color: "#27ae60"},
        {id: 5, name: "שונות", icon: "💼", budget: 500, spent: 150, color: "#9b59b6"}
    ]
};

// Utility Functions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return `₪${amount.toLocaleString('he-IL')}`;
}

function showMessage(text, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message--${type}`;
    messageEl.innerHTML = `
        <span>${type === 'success' ? '✓' : '⚠'}</span>
        <span>${text}</span>
    `;
    
    document.body.appendChild(messageEl);
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Data Persistence
function saveData() {
    try {
        const data = {
            routes: appState.routes,
            budgetCategories: appState.budgetCategories,
            expenses: appState.expenses,
            uploadedFiles: appState.uploadedFiles,
            theme: appState.theme
        };
        // Note: localStorage is not available in sandbox, so we just keep in memory
        console.log('Data saved:', data);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function loadData() {
    try {
        // In a real app, we would load from localStorage
        // For now, use sample data
        appState.routes = [...sampleData.routes];
        appState.budgetCategories = [...sampleData.budgetCategories];
        appState.expenses = [];
        appState.uploadedFiles = [];
    } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data as fallback
        appState.routes = [...sampleData.routes];
        appState.budgetCategories = [...sampleData.budgetCategories];
    }
}

// Tab Management
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${targetTab}-section`).classList.add('active');
            
            appState.currentTab = targetTab;
            
            // Initialize tab-specific functionality
            if (targetTab === 'budget') {
                renderBudgetCategories();
                renderBudgetChart();
            }
        });
    });
}

// Route Management
function initRoutes() {
    renderRouteSelect();
    initMapCanvas();
    
    // Event listeners
    document.getElementById('addRouteBtn').addEventListener('click', () => {
        showModal('routeModal');
    });
    
    document.getElementById('saveRouteBtn').addEventListener('click', saveNewRoute);
    document.getElementById('routeSelect').addEventListener('change', selectRoute);
    document.getElementById('addWaypointBtn').addEventListener('click', () => {
        showModal('waypointModal');
    });
    document.getElementById('saveWaypointBtn').addEventListener('click', saveWaypoint);
    document.getElementById('optimizeRouteBtn').addEventListener('click', optimizeRoute);
    document.getElementById('deleteRouteBtn').addEventListener('click', deleteCurrentRoute);
}

function renderRouteSelect() {
    const select = document.getElementById('routeSelect');
    select.innerHTML = '<option value="">בחר מסלול...</option>';
    
    appState.routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = route.name;
        select.appendChild(option);
    });
}

function selectRoute() {
    const routeId = document.getElementById('routeSelect').value;
    const route = appState.routes.find(r => r.id == routeId);
    
    if (route) {
        appState.currentRoute = route;
        showRouteDetails(route);
        drawRouteOnMap(route);
    } else {
        appState.currentRoute = null;
        hideRouteDetails();
        clearMap();
    }
}

function showRouteDetails(route) {
    document.getElementById('routeDetails').classList.remove('hidden');
    document.getElementById('routeDistance').textContent = `${route.distance} ק"מ`;
    document.getElementById('routeDuration').textContent = route.duration;
    renderWaypoints(route.waypoints);
}

function hideRouteDetails() {
    document.getElementById('routeDetails').classList.add('hidden');
}

function renderWaypoints(waypoints) {
    const list = document.getElementById('waypointsList');
    list.innerHTML = '';
    
    waypoints.forEach((waypoint, index) => {
        const li = document.createElement('li');
        li.className = 'waypoint-item';
        li.draggable = true;
        li.dataset.waypointId = waypoint.id;
        
        li.innerHTML = `
            <div class="waypoint-info">
                <div class="waypoint-name">${index + 1}. ${waypoint.name}</div>
                ${waypoint.notes ? `<div class="waypoint-notes">${waypoint.notes}</div>` : ''}
            </div>
            <div class="waypoint-actions">
                <button class="waypoint-btn" onclick="editWaypoint(${waypoint.id})" title="ערוך">✏️</button>
                <button class="waypoint-btn" onclick="deleteWaypoint(${waypoint.id})" title="מחק">🗑️</button>
            </div>
        `;
        
        // Add drag and drop functionality
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        
        list.appendChild(li);
    });
}

function saveNewRoute() {
    const name = document.getElementById('routeName').value.trim();
    if (!name) {
        showMessage('אנא הכנס שם למסלול', 'error');
        return;
    }
    
    const newRoute = {
        id: generateId(),
        name: name,
        waypoints: [],
        distance: 0,
        duration: "0 דקות"
    };
    
    appState.routes.push(newRoute);
    renderRouteSelect();
    document.getElementById('routeSelect').value = newRoute.id;
    selectRoute();
    hideModal('routeModal');
    document.getElementById('routeName').value = '';
    saveData();
    showMessage('מסלול נוצר בהצלחה');
}

function saveWaypoint() {
    const name = document.getElementById('waypointName').value.trim();
    const notes = document.getElementById('waypointNotes').value.trim();
    
    if (!name) {
        showMessage('אנא הכנס שם מקום', 'error');
        return;
    }
    
    if (!appState.currentRoute) {
        showMessage('אנא בחר מסלול תחילה', 'error');
        return;
    }
    
    const waypoint = {
        id: generateId(),
        name: name,
        lat: 32.0853 + (Math.random() - 0.5) * 0.1,
        lng: 34.7818 + (Math.random() - 0.5) * 0.1,
        notes: notes
    };
    
    appState.currentRoute.waypoints.push(waypoint);
    updateRouteInfo();
    renderWaypoints(appState.currentRoute.waypoints);
    drawRouteOnMap(appState.currentRoute);
    hideModal('waypointModal');
    document.getElementById('waypointName').value = '';
    document.getElementById('waypointNotes').value = '';
    saveData();
    showMessage('נקודת ציון נוספה בהצלחה');
}

function editWaypoint(waypointId) {
    const waypoint = appState.currentRoute.waypoints.find(w => w.id == waypointId);
    if (waypoint) {
        document.getElementById('waypointName').value = waypoint.name;
        document.getElementById('waypointNotes').value = waypoint.notes || '';
        document.getElementById('waypointModalTitle').textContent = 'ערוך נקודת ציון';
        
        // Update save button to handle edit
        const saveBtn = document.getElementById('saveWaypointBtn');
        saveBtn.onclick = () => updateWaypoint(waypointId);
        
        showModal('waypointModal');
    }
}

function updateWaypoint(waypointId) {
    const name = document.getElementById('waypointName').value.trim();
    const notes = document.getElementById('waypointNotes').value.trim();
    
    if (!name) {
        showMessage('אנא הכנס שם מקום', 'error');
        return;
    }
    
    const waypoint = appState.currentRoute.waypoints.find(w => w.id == waypointId);
    if (waypoint) {
        waypoint.name = name;
        waypoint.notes = notes;
        
        renderWaypoints(appState.currentRoute.waypoints);
        drawRouteOnMap(appState.currentRoute);
        hideModal('waypointModal');
        
        // Reset modal
        document.getElementById('waypointModalTitle').textContent = 'הוסף נקודת ציון';
        document.getElementById('saveWaypointBtn').onclick = saveWaypoint;
        document.getElementById('waypointName').value = '';
        document.getElementById('waypointNotes').value = '';
        
        saveData();
        showMessage('נקודת הציון עודכנה בהצלחה');
    }
}

function deleteWaypoint(waypointId) {
    if (confirm('האם אתה בטוח שברצונך למחוק נקודת ציון זו?')) {
        appState.currentRoute.waypoints = appState.currentRoute.waypoints.filter(w => w.id != waypointId);
        updateRouteInfo();
        renderWaypoints(appState.currentRoute.waypoints);
        drawRouteOnMap(appState.currentRoute);
        saveData();
        showMessage('נקודת הציון נמחקה');
    }
}

function deleteCurrentRoute() {
    if (!appState.currentRoute) return;
    
    if (confirm('האם אתה בטוח שברצונך למחוק מסלול זה?')) {
        appState.routes = appState.routes.filter(r => r.id !== appState.currentRoute.id);
        appState.currentRoute = null;
        renderRouteSelect();
        hideRouteDetails();
        clearMap();
        saveData();
        showMessage('המסלול נמחק');
    }
}

function optimizeRoute() {
    if (!appState.currentRoute || appState.currentRoute.waypoints.length < 3) {
        showMessage('נדרשות לפחות 3 נקודות ציון לאופטימיזציה', 'error');
        return;
    }
    
    // Simple optimization: shuffle waypoints (except first and last)
    const waypoints = [...appState.currentRoute.waypoints];
    const first = waypoints.shift();
    const last = waypoints.pop();
    
    // Shuffle middle waypoints
    for (let i = waypoints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [waypoints[i], waypoints[j]] = [waypoints[j], waypoints[i]];
    }
    
    appState.currentRoute.waypoints = [first, ...waypoints, last];
    updateRouteInfo();
    renderWaypoints(appState.currentRoute.waypoints);
    drawRouteOnMap(appState.currentRoute);
    saveData();
    showMessage('המסלול אופטמז בהצלחה');
}

function updateRouteInfo() {
    if (!appState.currentRoute) return;
    
    const numWaypoints = appState.currentRoute.waypoints.length;
    appState.currentRoute.distance = numWaypoints * 30; // Simplified calculation
    appState.currentRoute.duration = `${Math.ceil(numWaypoints * 0.5)} שעות`;
    
    showRouteDetails(appState.currentRoute);
}

// Drag and Drop for Waypoints
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const list = document.getElementById('waypointsList');
    list.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const list = document.getElementById('waypointsList');
    list.classList.remove('drag-over');
    
    if (draggedItem && this !== draggedItem) {
        const draggedId = draggedItem.dataset.waypointId;
        const targetId = this.dataset.waypointId;
        
        reorderWaypoints(draggedId, targetId);
    }
    
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}

function reorderWaypoints(draggedId, targetId) {
    const waypoints = appState.currentRoute.waypoints;
    const draggedIndex = waypoints.findIndex(w => w.id == draggedId);
    const targetIndex = waypoints.findIndex(w => w.id == targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const draggedWaypoint = waypoints.splice(draggedIndex, 1)[0];
        waypoints.splice(targetIndex, 0, draggedWaypoint);
        
        updateRouteInfo();
        renderWaypoints(waypoints);
        drawRouteOnMap(appState.currentRoute);
        saveData();
    }
}

// Map Canvas
function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw basic map background
    drawMapBackground(ctx);
    
    // Add click handler for adding waypoints
    canvas.addEventListener('click', (e) => {
        if (appState.currentRoute) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert canvas coordinates to lat/lng (simplified)
            const lat = 32.0853 + (y / canvas.height - 0.5) * 0.2;
            const lng = 34.7818 + (x / canvas.width - 0.5) * 0.2;
            
            addWaypointAtCoordinates(lat, lng);
        }
    });
}

function drawMapBackground(ctx) {
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawRouteOnMap(route) {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    
    drawMapBackground(ctx);
    
    if (!route || route.waypoints.length === 0) return;
    
    const waypoints = route.waypoints;
    
    // Draw route lines
    if (waypoints.length > 1) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        waypoints.forEach((waypoint, index) => {
            const x = (waypoint.lng - 34.6818) * canvas.width / 0.4 + canvas.width / 2;
            const y = (32.1853 - waypoint.lat) * canvas.height / 0.2 + canvas.height / 2;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    // Draw waypoint markers
    waypoints.forEach((waypoint, index) => {
        const x = (waypoint.lng - 34.6818) * canvas.width / 0.4 + canvas.width / 2;
        const y = (32.1853 - waypoint.lat) * canvas.height / 0.2 + canvas.height / 2;
        
        // Draw marker circle
        ctx.fillStyle = index === 0 ? '#27ae60' : index === waypoints.length - 1 ? '#e74c3c' : '#f39c12';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw marker border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw waypoint number
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(index + 1, x, y + 4);
    });
}

function clearMap() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    drawMapBackground(ctx);
}

function addWaypointAtCoordinates(lat, lng) {
    // Show modal for waypoint details
    document.getElementById('waypointName').value = `נקודה ${appState.currentRoute.waypoints.length + 1}`;
    showModal('waypointModal');
    
    // Store coordinates for when user saves
    window.pendingWaypointCoords = { lat, lng };
}

// Budget Management
function initBudget() {
    renderBudgetCategories();
    renderBudgetChart();
    
    document.getElementById('addExpenseBtn').addEventListener('click', () => {
        populateExpenseCategories();
        showModal('expenseModal');
    });
    
    document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);
}

function renderBudgetCategories() {
    const container = document.getElementById('budgetCategories');
    container.innerHTML = '';
    
    appState.budgetCategories.forEach(category => {
        const percentage = Math.min((category.spent / category.budget) * 100, 100);
        const remaining = category.budget - category.spent;
        const status = percentage > 90 ? 'over-budget' : percentage > 70 ? 'warning' : 'on-track';
        
        const categoryEl = document.createElement('div');
        categoryEl.className = 'budget-category';
        categoryEl.innerHTML = `
            <div class="category-info">
                <span class="category-icon">${category.icon}</span>
                <div class="category-details">
                    <h4>${category.name}</h4>
                    <div class="category-progress">
                        <div class="category-progress-bar" style="width: ${percentage}%; background-color: ${category.color}"></div>
                    </div>
                </div>
            </div>
            <div class="category-amounts">
                <div class="category-spent">${formatCurrency(category.spent)}</div>
                <div class="category-budget">מתוך ${formatCurrency(category.budget)}</div>
                <div class="status status--${status}">${remaining >= 0 ? `נותר ${formatCurrency(remaining)}` : `חריגה ${formatCurrency(-remaining)}`}</div>
            </div>
            <div class="category-actions">
                <button class="btn btn--sm btn--secondary" onclick="addExpenseToCategory(${category.id})">+ הוצאה</button>
                <button class="btn btn--sm btn--outline" onclick="editCategory(${category.id})">ערוך</button>
            </div>
        `;
        
        container.appendChild(categoryEl);
    });
    
    updateBudgetSummary();
}

function updateBudgetSummary() {
    const totalBudget = appState.budgetCategories.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = appState.budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    
    document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('totalRemaining').textContent = formatCurrency(totalRemaining);
}

function populateExpenseCategories() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = '<option value="">בחר קטגוריה...</option>';
    
    appState.budgetCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.icon} ${category.name}`;
        select.appendChild(option);
    });
}

function saveExpense() {
    const categoryId = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value.trim();
    
    if (!categoryId || !amount || amount <= 0) {
        showMessage('אנא מלא את כל השדות הנדרשים', 'error');
        return;
    }
    
    const category = appState.budgetCategories.find(c => c.id == categoryId);
    if (category) {
        category.spent += amount;
        
        const expense = {
            id: generateId(),
            categoryId: categoryId,
            amount: amount,
            description: description,
            date: new Date().toISOString()
        };
        
        appState.expenses.push(expense);
        
        renderBudgetCategories();
        renderBudgetChart();
        hideModal('expenseModal');
        
        // Clear form
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseCategory').value = '';
        
        saveData();
        showMessage('הוצאה נוספה בהצלחה');
    }
}

function addExpenseToCategory(categoryId) {
    populateExpenseCategories();
    document.getElementById('expenseCategory').value = categoryId;
    showModal('expenseModal');
}

function editCategory(categoryId) {
    const category = appState.budgetCategories.find(c => c.id == categoryId);
    if (category) {
        const newBudget = prompt(`תקציב חדש עבור ${category.name}:`, category.budget);
        if (newBudget && !isNaN(newBudget)) {
            category.budget = parseFloat(newBudget);
            renderBudgetCategories();
            renderBudgetChart();
            saveData();
            showMessage('תקציב עודכן בהצלחה');
        }
    }
}

function renderBudgetChart() {
    const canvas = document.getElementById('budgetChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const totalSpent = appState.budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    
    if (totalSpent === 0) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('אין הוצאות', centerX, centerY);
        return;
    }
    
    let currentAngle = -Math.PI / 2;
    
    appState.budgetCategories.forEach(category => {
        if (category.spent > 0) {
            const sliceAngle = (category.spent / totalSpent) * 2 * Math.PI;
            
            // Draw slice
            ctx.fillStyle = category.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        }
    });
}

// File Upload Management
function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    });
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    renderUploadedFiles();
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    files.forEach(file => {
        if (isValidFileType(file)) {
            const fileData = {
                id: generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                content: null
            };
            
            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                fileData.content = e.target.result;
                appState.uploadedFiles.push(fileData);
                renderUploadedFiles();
                saveData();
                showMessage(`קובץ ${file.name} הועלה בהצלחה`);
                
                // Try to parse and import route
                tryImportRoute(fileData);
            };
            reader.readAsText(file);
        } else {
            showMessage(`סוג קובץ לא נתמך: ${file.name}`, 'error');
        }
    });
}

function isValidFileType(file) {
    const validTypes = ['.gpx', '.kml', '.json'];
    return validTypes.some(type => file.name.toLowerCase().endsWith(type));
}

function renderUploadedFiles() {
    const container = document.getElementById('filesList');
    container.innerHTML = '';
    
    if (appState.uploadedFiles.length === 0) {
        container.innerHTML = '<div class="empty-state">אין קבצים שהועלו</div>';
        return;
    }
    
    appState.uploadedFiles.forEach(file => {
        const fileEl = document.createElement('div');
        fileEl.className = 'file-item';
        fileEl.innerHTML = `
            <div class="file-info">
                <span class="file-icon">📄</span>
                <div class="file-details">
                    <h5>${file.name}</h5>
                    <div class="file-size">${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleDateString('he-IL')}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn--sm btn--primary" onclick="importRouteFromFile('${file.id}')">ייבא מסלול</button>
                <button class="btn btn--sm btn--outline" onclick="deleteFile('${file.id}')">מחק</button>
            </div>
        `;
        
        container.appendChild(fileEl);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function tryImportRoute(fileData) {
    try {
        let routeData = null;
        
        if (fileData.name.endsWith('.json')) {
            routeData = parseJSONRoute(fileData.content);
        } else if (fileData.name.endsWith('.gpx')) {
            routeData = parseGPXRoute(fileData.content);
        } else if (fileData.name.endsWith('.kml')) {
            routeData = parseKMLRoute(fileData.content);
        }
        
        if (routeData) {
            const newRoute = {
                id: generateId(),
                name: routeData.name || `מסלול מ-${fileData.name}`,
                waypoints: routeData.waypoints,
                distance: routeData.distance || 0,
                duration: routeData.duration || "לא ידוע"
            };
            
            appState.routes.push(newRoute);
            renderRouteSelect();
            saveData();
            showMessage(`מסלול "${newRoute.name}" יובא בהצלחה`);
        }
    } catch (error) {
        console.error('Error importing route:', error);
        showMessage('שגיאה בייבוא המסלול', 'error');
    }
}

function parseJSONRoute(content) {
    const data = JSON.parse(content);
    return {
        name: data.name,
        waypoints: data.waypoints || [],
        distance: data.distance,
        duration: data.duration
    };
}

function parseGPXRoute(content) {
    // Simplified GPX parsing
    const waypoints = [];
    const waypointRegex = /<wpt[^>]*lat="([^"]*)"[^>]*lon="([^"]*)"[^>]*>[\s\S]*?<name>([^<]*)<\/name>/g;
    let match;
    
    while ((match = waypointRegex.exec(content)) !== null) {
        waypoints.push({
            id: generateId(),
            name: match[3],
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
            notes: ""
        });
    }
    
    return {
        name: "מסלול מ-GPX",
        waypoints: waypoints
    };
}

function parseKMLRoute(content) {
    // Simplified KML parsing
    const waypoints = [];
    const placemarkRegex = /<Placemark>[\s\S]*?<name>([^<]*)<\/name>[\s\S]*?<coordinates>([^<]*)<\/coordinates>[\s\S]*?<\/Placemark>/g;
    let match;
    
    while ((match = placemarkRegex.exec(content)) !== null) {
        const coords = match[2].trim().split(',');
        if (coords.length >= 2) {
            waypoints.push({
                id: generateId(),
                name: match[1],
                lat: parseFloat(coords[1]),
                lng: parseFloat(coords[0]),
                notes: ""
            });
        }
    }
    
    return {
        name: "מסלול מ-KML",
        waypoints: waypoints
    };
}

function importRouteFromFile(fileId) {
    const file = appState.uploadedFiles.find(f => f.id === fileId);
    if (file) {
        tryImportRoute(file);
    }
}

function deleteFile(fileId) {
    if (confirm('האם אתה בטוח שברצונך למחוק קובץ זה?')) {
        appState.uploadedFiles = appState.uploadedFiles.filter(f => f.id !== fileId);
        renderUploadedFiles();
        saveData();
        showMessage('הקובץ נמחק');
    }
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    modal.classList.add('active');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    modal.classList.add('hidden');
}

function initModals() {
    // Close modal when clicking close button or outside
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    themeToggle.addEventListener('click', () => {
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-color-scheme', appState.theme);
        themeToggle.textContent = appState.theme === 'light' ? '🌙' : '☀️';
        saveData();
    });
    
    // Set initial theme
    document.documentElement.setAttribute('data-color-scheme', appState.theme);
    themeToggle.textContent = appState.theme === 'light' ? '🌙' : '☀️';
}

// Initialize Application
function initApp() {
    loadData();
    initTabs();
    initRoutes();
    initBudget();
    initFileUpload();
    initModals();
    initTheme();
    
    // Set initial route if available
    if (appState.routes.length > 0) {
        document.getElementById('routeSelect').value = appState.routes[0].id;
        selectRoute();
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);