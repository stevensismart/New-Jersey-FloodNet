const sensorCoordinates = [
    { number: 12, lat: 40.9948594604189, lng: -74.02735098264648, name: 'Sensor 12 @ Overbrook Park', image: "./images/sensor12/overbrook_park.jpeg",spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 13, lat: 40.99852592064648, lng: -74.03005456805411, name: 'Sensor 13 @ Brookside Park', image: "./images/sensor13/brookside_park.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 14, lat: 40.99641869891097, lng: -74.0399895426159, name: 'Sensor 14 @ K-mart', image: "./images/sensor14/kmart.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 15, lat: 40.99895153624935, lng: -74.0402086386315, name: 'Sensor 15 @ Richard Nugent Park', image: "./images/sensor15/richard_nugent_park.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 18, lat: 40.99993328198413, lng: -74.04005036459259, name: 'Sensor 18 @ Hillsdale Public Works Department', image: "./images/sensor18/hillsdale_public_works.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 16, lat: 40.73584599585296, lng: -74.02767888184088, name: 'Sensor 16 @ Hoboken Terminal', image: "./images/sensor16/hoboken_terminal.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 19, lat: 40.746555657779005, lng: -74.03198526745322, name: 'Sensor 19 @ Finnegan\'s Hoboken', image: "./images/sensor19/Finnegan.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 17, lat: 40.73956787312875, lng: -74.04257713746442, name: 'Sensor 17 @ Hoboken 1st Street', image: "./images/sensor17/sky_barbers.jpeg", spreadsheetId: '1X3Zp02qta_OV76s01pV52FV0kn3x3w0x7kzGLltbH6o', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 26, lat: 41.00780536383797, lng: -74.04749480127796, name: 'Sensor 26 @ Queen Ct - Westwood', image: "./images/sensor26/queen_ct_westwood.jpeg", spreadsheetId: '1vKp82zeHvWvt-DLxPd2neIm4JHoU_hY7T6yt41mh8eo', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 22, lat: 41.02884217070034, lng: -74.04820204772778, name: 'Sensor 22 @ Bear Brook & Glen Road', image: "./images/sensor22/bear_brook.jpeg", spreadsheetId: '16cnoxRoM5UEcXONfa8wyUZiHcVuMDkBHVzsNLz9dZos', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 23, lat: 41.035141399902244, lng: -74.03901540144574, name: 'Sensor 23 @ Mill Brook & Willet St', image: "./images/sensor23/mill_brook.jpeg", spreadsheetId: '1hrQBoei2zxBWyoPCtqAksEDiLdtp1uL0AxTpRVbfBfA', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
    { number: 25, lat: 40.98653799845786, lng: -74.02812967555288, name: 'Sensor 25 @ Misquapsink Brook', image: "./images/sensor25/misquapsink_brook.jpeg", spreadsheetId: '1oM62__RdH5naxflkVo9_l5iyWY9d_Ij-shAt0rS_gwM', apiKey: 'AIzaSyDo0gFx2YjNdhSqgjrWWmX-eK0Flyvy5vc', },
];

let map;
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaWd1bDk0IiwiYSI6ImNtMzRtcnFnejAwMGwyanB4cDMxZnA4em8ifQ.93yyvSuGOpJeaprYmWy1KQ';  // Replace with your Mapbox token

function preloadImages() {
    sensorCoordinates.forEach(coords => {
        const img = new Image();
        img.src = coords.image;
    });
}

function initMap() {
    if (map) {
        map.remove();  // Properly remove the existing map instance
    }

    map = L.map('map').setView([40.80391741650648, -74.0319076685521], 10);

    // Define tile layers
    const openStreetMapTiles = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const mapboxTiles = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Add Mapbox tiles as the default layer
    mapboxTiles.addTo(map);

    // Add layer control to toggle between map backgrounds
    L.control.layers({
        "Satellite Map": mapboxTiles,
        "Street Map": openStreetMapTiles
    }).addTo(map);

    // Preload images to ensure they're cached before displaying
    preloadImages();

    // Add markers
    sensorCoordinates.forEach((coords, index) => {
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);

        // Bind tooltip with a placeholder
        marker.bindTooltip(
            `<div class="sensor-tooltip">
                <div class="sensor-title">${coords.name}</div>
                <img src="${coords.image}" alt="${coords.name}" onerror="this.onerror=null;this.src='./images/placeholder.jpg';">
            </div>`,
            { permanent: false, direction: 'top', className: 'custom-tooltip' }
        );

        // On marker click, trigger chart creation or other interactions
        marker.on('click', () => {
            createCharts(index, marker, coords);
        });
    });
}

// Initialize map after the page loads
window.onload = initMap;
