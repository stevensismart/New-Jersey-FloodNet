const sensorCoordinates = [
    { number: 12, lat: 40.9948594604189, lng: -74.02735098264648, name: 'Sensor 12 @ Overbrook Park', image: "./images/sensor12/overbrook_park.jpeg" },
    { number: 13, lat: 40.99852592064648, lng: -74.03005456805411, name: 'Sensor 13 @ Brookside Park', image: "./images/sensor13/brookside_park.jpeg" },
    { number: 14, lat: 40.99641869891097, lng: -74.0399895426159, name: 'Sensor 14 @ K-mart', image: "./images/sensor14/kmart.jpeg" },
    { number: 15, lat: 40.99895153624935, lng: -74.0402086386315, name: 'Sensor 15 @ Richard Nugent Park', image: "./images/sensor15/richard_nugent_park.jpeg" },
    { number: 18, lat: 40.99993328198413, lng: -74.04005036459259, name: 'Sensor 18 @ Hillsdale Public Works Department', image: "./images/sensor18/hillsdale_public_works.jpeg" }
];

let map;

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaWd1bDk0IiwiYSI6ImNtMzRtcnFnejAwMGwyanB4cDMxZnA4em8ifQ.93yyvSuGOpJeaprYmWy1KQ';  // Replace with your Mapbox token

function initMap() {
    if (map) {
        map.remove();  // Properly remove the existing map instance
    }

    map = L.map('map').setView([40.9867281870996, -74.03802581654276], 13);

    // Define tile layers
    const openStreetMapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const mapboxTiles = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Add Mapbox tiles as the default layer
    mapboxTiles.addTo(map);

    // Add layer control to toggle between map backgrounds
    L.control.layers({
        "Mapbox Streets": mapboxTiles,
        "OpenStreetMap": openStreetMapTiles
    }).addTo(map);

    sensorCoordinates.forEach((coords, index) => {
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);

        marker.bindTooltip(
            `<div class="sensor-tooltip">
                <div class="sensor-title">${coords.name}</div>
                <img src="${coords.image}" alt="${coords.name}">
            </div>`,
            { permanent: false, direction: 'top', className: 'custom-tooltip' }
        );
        marker.on('click', () => {
            createCharts(index, marker, coords);
        });
    });
}

