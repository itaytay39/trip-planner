// Mobile Navigation
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    body.setAttribute('data-theme', 
        body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
}

// Route Filtering
function filterRoutes(filterValue) {
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach(card => {
        card.classList.toggle('hidden', 
            filterValue !== 'all' && 
            card.getAttribute('data-route') !== filterValue
        );
    });
}

// Initialize Map
let map;
function initMap() {
    map = L.map('map').setView([39.2904, -76.6122], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    // Add mobile menu functionality here
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});
