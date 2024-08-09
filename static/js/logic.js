// Create the map object
const map = L.map('map').setView([0, 0], 2);
 
// Add the tile layer (OSM)
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
 
// URLs for earthquake and tectonic plate data
const EARTHQUAKES_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const TECTONIC_PLATES_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
 
// Create layer groups
const earthquakeLayer = L.layerGroup().addTo(map);
const tectonicPlatesLayer = L.layerGroup().addTo(map);
 
// Fetch earthquake data and plot on the map
d3.json(EARTHQUAKES_URL).then(data => {
    // Process and plot the earthquake data
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            const magnitude = feature.properties.mag;
            const radius = magnitude * 4;
            return L.circleMarker(latlng, {
                radius: radius,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
        }
    }).addTo(earthquakeLayer);
});
 
// Fetch tectonic plate data and plot on the map
d3.json(TECTONIC_PLATES_URL).then(data => {
    // Process and plot the tectonic plate data
    L.geoJSON(data, {
        style: {
            color: "orange",
            weight: 2
        }
    }).addTo(tectonicPlatesLayer);
});
 
// Helper function to determine the color based on depth
function getColor(depth) {
    if (depth > 90) return "#ea2c2c";
    if (depth > 70) return "#ea822c";
    if (depth > 50) return "#ee9c00";
    if (depth > 30) return "#eecc00";
    if (depth > 10) return "#d4ee00";
    return "#98ee00";
}
 
// Add legend
const legend = L.control({ position: "bottomright" });
 
legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info legend");
    const grades = [-10, 10, 30, 50, 70, 90];
    const labels = [];
 
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
 
    return div;
};
 
legend.addTo(map);
 
// Add layer control
const baseMaps = {
    "OpenStreetMap": osm
};
 
const overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};
 
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);