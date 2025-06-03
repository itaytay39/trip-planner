// דטה בסיסית של מסלולים
let routes = [
    {
        id: "baltimore-maine",
        name: "בולטימור למיין",
        type: "coastal",
        days: 8,
        distance: 1365,
        cost: 2500,
        stops: ["בולטימור", "פורטסמות'", "אוגוסטה", "בר הרבור", "פטן", "פורטלנד"]
    },
    {
        id: "jerusalem-hills",
        name: "הרי ירושלים",
        type: "mountain",
        days: 2,
        distance: 60,
        cost: 400,
        stops: ["ירושלים", "עין כרם", "הסטף", "נס הרים"]
    }
];

// מסלולים מותאמים אישית
let customRoutes = [];

// טעינת מסלולים לדף
function renderRoutes() {
    const container = document.getElementById('routesContainer');
    container.innerHTML = "";
    [...routes, ...customRoutes].forEach(route => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.setAttribute('data-route', route.type === 'custom' ? 'custom' : route.type);
        card.innerHTML = `
            <div class="route-header">
                <div class="route-title">${route.name}</div>
                <span class="route-duration">${route.days} ימים</span>
            </div>
            <div class="route-stops">
                ${route.stops.map(stop => `<div class="stop">${stop}</div>`).join('')}
            </div>
            <div class="route-stats">
                <div class="stat"><i class="fas fa-road"></i> ${route.distance} ק״מ</div>
                <div class="stat"><i class="fas fa-dollar-sign"></i> $${route.cost}</div>
            </div>
            <div class="route-actions">
                <button class="btn-primary" onclick="showRouteOnMap('${route.name}')">הצג במפה</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// סינון מסלולים
function filterRoutes() {
    const filter = document.getElementById('routeFilter').value;
    const cards = document.querySelectorAll('.route-card');
    cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-route') === filter) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// הצגת מסלול במפה
function showRouteOnMap(routeName) {
    showSection('map');
    const route = [...routes, ...customRoutes].find(r => r.name === routeName);
    if (!route) return;
    if (!window.map) return;
    window.map.eachLayer(layer => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker) {
            window.map.removeLayer(layer);
        }
    });
    // מציאת קואורדינטות בסיסיות (דמו)
    const coordsDict = {
        "בולטימור": [39.2904, -76.6122],
        "פורטסמות'": [43.0718, -70.7626],
        "אוגוסטה": [44.3106, -69.7795],
        "בר הרבור": [44.3876, -68.2039],
        "פטן": [45.2538, -69.4455],
        "פורטלנד": [43.6591, -70.2568],
        "ירושלים": [31.7683, 35.2137],
        "עין כרם": [31.7617, 35.1535],
        "הסטף": [31.7734, 35.1422],
        "נס הרים": [31.7192, 35.0411]
    };
    const coords = route.stops.map(stop => coordsDict[stop]).filter(Boolean);
    if (coords.length > 0) {
        const poly = L.polyline(coords, {color: '#3498db', weight: 5}).addTo(window.map);
        coords.forEach((c, i) => {
            L.marker(c).addTo(window.map).bindPopup(route.stops[i]);
        });
        window.map.fitBounds(poly.getBounds(), {padding: [30, 30]});
    }
}

// מעבר בין מסכים
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId + '-section').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (sectionId === 'routes') document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    if (sectionId === 'map') document.querySelector('.nav-item:nth-child(2)').classList.add('active');
}

// מצב לילה/יום
function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// טופס הוספת מסלול
function showAddRouteForm() {
    document.getElementById('addRouteForm').style.display = 'flex';
}
function hideAddRouteForm() {
    document.getElementById('addRouteForm').style.display = 'none';
}
function addCustomRoute() {
    const name = document.getElementById('routeName').value.trim();
    const type = document.getElementById('routeType').value.trim() || 'custom';
    const stops = document.getElementById('routeStops').value.split(',').map(s => s.trim()).filter(Boolean);
    const days = Number(document.getElementById('routeDays').value) || 1;
    const distance = Number(document.getElementById('routeDistance').value) || 1;
    const cost = Number(document.getElementById('routeCost').value) || 0;
    if (!name || !stops.length) {
        alert('נא למלא שם מסלול ונקודות עצירה');
        return;
    }
    customRoutes.push({id: name + Date.now(), name, type, days, distance, cost, stops});
    hideAddRouteForm();
    renderRoutes();
    filterRoutes();
}

// אתחול מפה
function initMap() {
    window.map = L.map('map').setView([32.0853, 34.7818], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.map);
    // מסלול ברירת מחדל
    showRouteOnMap(routes[0].name);
}

// אתחול ראשוני
document.addEventListener('DOMContentLoaded', () => {
    renderRoutes();
    initMap();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
});
