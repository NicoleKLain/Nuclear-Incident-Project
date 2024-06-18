// Define a custom styling function based on the INES level
function getColor(inesLevel) {
    return inesLevel >= 7 ? '#800026' :
           inesLevel >= 6 ? '#BD0026' :
           inesLevel >= 5 ? '#E31A1C' :
           inesLevel >= 4 ? '#FC4E2A' :
           inesLevel >= 3 ? '#FD8D3C' :
           inesLevel >= 2 ? '#FEB24C' :
           inesLevel >= 1 ? '#FED976' :
                            '#FFEDA0';
}

var map = L.map('map').setView([20, 0], 2); // Adjust zoom level for a broader view

// Add the title "Nuclear Incidents by Country" using Leaflet's Control class
var titleControl = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = '<h3>Nuclear Incidents by Country</h3>';
        return div;
    }
});

// Add the custom control to the map
map.addControl(new titleControl());

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

d3.json("nuclearincidents.json").then(data => {
    console.log(data);

    var geojsonFeatures = {
        "type": "FeatureCollection",
        "features": []
    };

    data.forEach(function(incident) {
        if (incident.Latitude && incident.Longitude) {
            var feature = {
                "type": "Feature",
                "properties": {
                    "Year": incident.Year,
                    "Incident": incident.Incident,
                    "INES level": incident['INES level'],
                    "Country": incident.Country,
                    "IAEA description": incident['IAEA description']
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [incident.Longitude, incident.Latitude]
                }
            };
            geojsonFeatures.features.push(feature);
        }
    });

    L.geoJSON(geojsonFeatures, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: getColor(feature.properties['INES level']),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`<b>${feature.properties.Incident}</b><br>${feature.properties.Country}<br>INES Level: ${feature.properties['INES level']}<br><br>${feature.properties.Year}`);
        }
    }).addTo(map);
})
.catch(error => console.error('Error loading JSON file:', error));