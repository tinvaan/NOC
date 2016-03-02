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
        console.log("\nfuck you !");
    }
}

function checkPotentialCollisions(curr_lat, curr_lng) {
    console.log("\nScanning the zone for potential collisions");

    for (index = 0; index < markersList.length; index++) {
        //DEBUG:
        console.log("\nLatitude difference = " + Math.abs(curr_lat - markersList[index].lat));
        console.log("\nLongitude difference = " + Math.abs(curr_lng - markersList[index].lng));

        var iter = markersList[index];
        if ((curr_lat == iter.lat) &&
            (curr_lng == iter.lng)
           ) {
            console.log("\nHaven't you collided yet ? Meh !");
            return false;
           } else {
               if ((Math.abs(curr_lat - iter.lat) < 50.00) &&
                   (Math.abs(curr_lng - iter.lng) < 50.00)) {
                   console.log("\nAlert! Potential collision detected");
                    return true;
               } else return false;
           }
    }
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
