// Initialize map
function initMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded! Check CDN connection');
        return;
    }

    // Create map instance
    const map = L.map('map').setView([31.0461, 34.8516], 8); // Center on Israel

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add default markers
    const locations = [
        {name: 'תל אביב', coords: [32.0853, 34.7818]},
        {name: 'ירושלים', coords: [31.7683, 35.2137]},
        {name: 'אילת', coords: [29.5577, 34.9519]}
    ];

    locations.forEach(loc => {
        L.marker(loc.coords)
            .addTo(map)
            .bindPopup(`<b>${loc.name}</b>`);
    });
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
});

// Add error handling
window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
    alert('אירעה שגיאה: ' + e.message);
});
