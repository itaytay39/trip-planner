// Initialize Map
function initMap() {
    const map = L.map('map', {
        zoomControl: false,
        gestureHandling: true
    }).setView([32.0853, 34.7818], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add sample markers
    const locations = [
        {name: 'תל אביב', coords: [32.0853, 34.7818]},
        {name: 'ירושלים', coords: 31.7683, 35.2137},
        {name: 'אילת', coords: [29.5577, 34.9519]}
    ];

    locations.forEach(loc => {
        L.marker(loc.coords)
            .addTo(map)
            .bindPopup(`<b>${loc.name}</b>`)
            .on('click', function(e) {
                map.setView(e.latlng, 13);
            });
    });

    return map;
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Navigation
function showSection(section) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.querySelector(`.${section}-section`).classList.add('active');
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const map = initMap();
    
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark') document.body.classList.add('dark-theme');
    
    // Event Listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showSection(this.dataset.section);
        });
    });
});
