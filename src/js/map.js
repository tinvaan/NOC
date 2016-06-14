/**
 * Display animations and handle events on the map
 * Author: R. Harish Navnit<harishnavnit@gmail.com>
 */

var socket = io.connect();

/**
 * Variables to display the main map
 */
L.mapbox.projectId = 'rharish.p2i83c48';
L.mapbox.accessToken = 'pk.eyJ1IjoicmhhcmlzaCIsImEiOiJjaWs4OWl4bGQwMWcydHhrd3ZmczdzN2lsIn0.mCz4ybX25lp0z7-rXXxqiQ';

var mapTiles = L.tileLayer('https://api.mapbox.com/v4/' + L.mapbox.projectId
                    + '/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>'
});
var map = L.map('map').addLayer(mapTiles).setView([0.0, 0.0], 2);
var markersList = [];
var remoteDevicesLocation = [];


/**
 * Draws a circle on the map
 */
function drawCircle(lat, lng, radius) {
    L.circle([lat, lng], radius, {
       color: 'red',
       fillColor: '#f03',
       fillOpacity: 0.5
   }).addTo(map);
}

/**
 * Draw a polygon on the map
 * @param: array of latitude and longitude values
 */
function drawPolygon(latlngArray) {
    var polygonPoints = [];
    for (index = 0; index < latlngArray.length; ++index) {
        polygonPoints.insert(latlngArray[index].lat, latlngArray[index].lng);
    }
    return L.polygon(polygonPoints).addTo(map);
}

/**
 * Draw trajectories on the map
 */
function drawTrajectory(path, lineColor) {
    var pointsList = [];
    for (index = 0; index < devicesConnected; ++index) {
        var point = new L.LatLng(path[index].lat, path[index].lng);
        pointsList.splice(index, 0, point);
    }
    var polyLine = new L.Polyline(pointsList, {
        color: lineColor,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    polyLine.addTo(map);
}

function predictedLine(pData, lineColor) {
    console.log("Drawing the linear regression line");
    var pLine = new L.Polyline(pData, {
        color: lineColor,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    pLine.addTo(map);
    console.log("Added new line to the map");
}

/**
 * Display the current position of devices
 */
function showCurrentObjectLocations() {
    console.log("\nObjects spotted at ");
    for (index = 0; index < markersList.length; index++) {
        console.log(markersList[index]);
        //console.log("{" + markersList[index].lat + ", " + markersList[index].lng + "}");
    }
}

/**
 * Keep track of connected devices
 */
function pushMarkersToList(marker) {
    markersList.push(marker.getLatLng());
    showCurrentObjectLocations();
    processMarkers(markersList);
}

/**
 * Check if any two objects could possibly collide
 */
function checkPotentialCollisions(curr_lat, curr_lng) {
    //console.log("\nScanning the zone for potential collisions");
    var R = 6372.795477598;     //Radius of the earth kms

    /*
     * If the distance between the coordinates is less than
     * a certain threshold, sound an alert
     */
    for (index = 0; index < markersList.length; index++) {
        var iter = markersList[index];
        var distance = R * Math.acos(
            Math.sin(curr_lat) * Math.sin(iter.lat) +
            Math.cos(curr_lat) * Math.cos(iter.lat) *
            Math.cos(curr_lng - iter.lng)
        );
        //console.log("\nObject " + index + " is at distance of : " + distance + " meters ");
        if (distance == 0)  return false;
        else if (distance > 1500.0) return false;
        else return true;
    }
    //processMarkers(markersList);
}

/**
 * Send an alert to the appropriate device
 */
function sendAlertToRemoteDevice(deviceAtLat, deviceAtLng) {
    socket.emit("Alert", deviceAtLat, deviceAtLng);
    console.log("\nAttempting to connect to remote device");
}

/**
 * Store the locations of the remote devices in an array
 */
function storeRemoteLocations(rlat, rlng) {
    var rLatLng = L.latLng(rlat, rlng);
    var remoteMarker = L.marker(rlatLng).setLatLng(rlatLng).addTo(map);
    remoteMarkersList.push(remoteMarker);
    //socket.emit('LatLng data ready', remoteMarkersList);
}

/**
 * Handle clicks on the map
 */
function onMapClick(e) {
    //alert("You clicked " + e.latlng);
    socket.emit('mapClick', e.latlng);
    var currLocation_popup = L.popup()
                                .setLatLng(e.latlng)
                                .setContent(e.latlng.toString())
                                .openOn(map);
    var currLocation_marker= L.marker(e.latlng).addTo(map);

    currLocation_marker.bindPopup(currLocation_popup).openPopup();
    pushMarkersToList(currLocation_marker);
}

/**
 * Problem here is that when more than one devices starts
 * emitting data, there's no way to recognize which location
 * object corresponds to which device.
 * Possible solutions:
 *  1. Implment a login feature on the Android side and emit
 *     Username/Password along with the location
 *  2. Just assign a hashcode to each device, needs to be done
 *     on the android side again, and send it along with the
 *     location of the device
 */
socket.on('Device located', function(nick, lat, lng, timestamp) {
    console.log("A new device was located");

    // Variables to hold incoming data
    var entry        = [],
        location     = [],
        namedDevices = new Map();

    // Create a location object, holding the incoming lat/longs
    location.splice(0, 0, lat); location.splice(1, 0, lng);

    // Push this location to a set of lat/longs
    entry.push(location);

    if (!namedDevices.has(nick)) {
        // Assign the created set of lat/longs to the device nick
        namedDevices.set(nick, entry);
    } else {
        // Find the locations corresponding to the nick
        var valueEntry = namedDevices.get(nick);

        /* Check if the previous element in the list is not the
         * same as the current location
         */
        if (valueEntry[valueEntry.length - 1] != location) {
            // Add the new location to the end of the list
            valueEntry.splice((valueEntry.length - 1), 0, location);
            namedDevices.set(nick, valueEntry);
        }
    }

    // Clear the location and entry objects
    entry = [], location = [];
});

/**
 * Emitted when the location of a device changes
 */
socket.on('Device location changed', function(locArray) {
    console.log("A remote device was spotted at [" +
                locArray[0] + ", " + locArray[1] + "] ");

    if (checkPotentialCollisions(locArray[0], locArray[1])) {
        drawCircle(locArray[0], locArray[1], 100000.00);
        sendAlertToRemoteDevice(locArray[0], locArray[1]);
    }
});
socket.on('Alert animation', function(lat, lng) {
    drawCircle(lat, lng, 30);
});
socket.on('Regression computed', function(regResult) {
    showRegressionPoints(regResult);
});
/**
 * Draw a line through the points in @param
 * @param: [[lat,lng] ... [lat,lng]]
 */
socket.on('Global line', function(globalLine) {
    predictedLine(globalLine, 'yellow');
});

map.on('click', onMapClick);
