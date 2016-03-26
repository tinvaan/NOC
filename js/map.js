/* Embed the map to the webpage */

L.mapbox.projectId = 'rharish.p2i83c48';
L.mapbox.accessToken = 'pk.eyJ1IjoicmhhcmlzaCIsImEiOiJjaWs4OWl4bGQwMWcydHhrd3ZmczdzN2lsIn0.mCz4ybX25lp0z7-rXXxqiQ';

var mapTiles = L.tileLayer('https://api.mapbox.com/v4/' + L.mapbox.projectId
                    + '/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>'
});
var map = L.map('map').addLayer(mapTiles).setView([0.0, 0.0], 2);
var markersList = [];

function drawCircle(lat, lng, radius) {
    L.circle([lat, lng], radius, {
       color: 'red',
       fillColor: '#f03',
       fillOpacity: 0.5
   }).addTo(map);
}

//FIXME: Do not hardcode values
function drawPolygon() {
    return L.polygon([
        [23.509, -0.08],
        [23.503, -0.06],
        [23.51, -0.047]
    ]).addTo(map);
}

function showCurrentObjectLocations() {
    console.log("\nObjects spotted at ");
    for (index = 0; index < markersList.length; index++) {
        console.log(markersList[index]);
        console.log("{" + markersList[index].lat + ", " + markersList[index].lng + "}");
    }
}

function pushMarkersToList(marker) {
    markersList.push(marker.getLatLng());
    showCurrentObjectLocations();

    var needsAlert = checkPotentialCollisions(marker.getLatLng().lat, marker.getLatLng().lng);

    if (needsAlert) {
        drawCircle(marker.getLatLng().lat, marker.getLatLng().lng, 100000.00);
        sendAlertToRemoteDevice();
    }
}

function checkPotentialCollisions(curr_lat, curr_lng) {
    console.log("\nScanning the zone for potential collisions");
    var R = 6372.795477598;     //Radius of the earth kms

    for (index = 0; index < markersList.length; index++) {
        var iter = markersList[index];
        var distance = R * Math.acos(
            Math.sin(curr_lat) * Math.sin(iter.lat) +
            Math.cos(curr_lat) * Math.cos(iter.lat) *
            Math.cos(curr_lng - iter.lng)
        );
        console.log("\nObject " + index + " is at distance of : " + distance + " meters ");
        if (distance == 0)  return false;
        else if (distance > 1500.0) return false;
        else return true;
    }
}

function sendAlertToRemoteDevice() {
    console.log("\nAttempting to connect to remote device");
}

function onMapClick(e) {
    //alert("You clicked " + e.latlng);
    var currLocation_popup = L.popup()
                                .setLatLng(e.latlng)
                                .setContent(e.latlng.toString())
                                .openOn(map);
    var currLocation_marker= L.marker(e.latlng).addTo(map);

    currLocation_marker.bindPopup(currLocation_popup).openPopup();
    pushMarkersToList(currLocation_marker);
}

map.on('click', onMapClick);
