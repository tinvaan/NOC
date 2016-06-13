/**
 * Path predictor module in Javascript using
 * the regression module for NodeJs
 * Used to predict the next set of coordinates
 * of an object, given current set of coordinates
 *
 * Author: R. Harish Navnit<harishnavnit@gmail.com>
 */

var latlngData    = [];
var cartesianData = [];

/**
 * Extract the latitude and longitude from a list of markers
 * @param: a list of markers containing {lat, lng} values
 */
function processMarkers(markers) {
    var locationObject = [];
    socket.emit('test');
    for (index = 0; index < markers.length; index++) {
        locationObject.splice(0, 0, markers[index].lat);
        locationObject.splice(1, 0, markers[index].lng);
        //locationObject.push(markers[index].hashedCode);

        latlngData.splice(index, 0, locationObject);
        locationObject = [];
    }
    socket.emit('LatLng data ready', latlngData);
    toCartesianCoordinates(latlngData);
    return latlngData;
}

/**
 * Convert the latitude and longitude values to cartesian coordinates
 * @param latlngData - array of array of lat,lng objects
 * @returns {Array} containing of cartesian data
 */
function toCartesianCoordinates(latlngVals) {
    var R = 6372.795477598;     //Radius of the earth kms
    var locationObject = [];
    for (index = 0; index < latlngVals.length; index++) {
        var x = R * Math.cos(latlngVals[index][0]) * Math.cos(latlngVals[index][1]);
        var y = R * Math.cos(latlngVals[index][0]) * Math.sin(latlngVals[index][1]);
        var z = R * Math.sin(latlngVals[index][0]);
        locationObject.splice(0, 0, x);
        locationObject.splice(1, 0, y);
        locationObject.splice(2, 0, z);
        cartesianData.splice(index, 0, locationObject);
        locationObject = [];
    }
    socket.emit("Cartesian Conversion", cartesianData);
    return cartesianData;
}


/**
 * Calculates the initial bearing angle in Radians
 * @param startLat Latitude of the first point
 * @param startLng Longitude of the first point
 * @param finishLat Latitude of the second point
 * @param finshLng Longitude of the second point
 */
function intitialBearing(startLat, startLng, finishLat, finshLng) {
    var y = Math.sin(finishLng - startLng) * Math.cos(finishLat);
    var y = Math.cos(startLat) * Math.sin(finishLat) -
            Math.sin(startLat) * Math.cos(finishLat) * Math.cos(finishLng - startLng);
    var bearing = Math.atan2(y, x);
}

/**
 * Converts the bearing angle in Radians to degrees
 * @param bearing
 * @returns bearing angle in degrees
 */
function initialBearing_degrees(bearing) {
    return bearing.toDegrees();
}

function showRegressionPoints(pointsList) {
    console.log(pointsList[0][0]);
    for (index = 0; index < pointsList.length; ++index) {
        var point = pointsList[index];
        for (innerIndex = 0; innerIndex < pointsList.length; ++innerIndex) {
            console.log("{ " + point[0] + ", " + point[1] + "} ");
        }
    }
}

function plotRegressionLine() {

}

function gradientAndOffset() {

}

function parseCSV(csvFile) {

}

function printCSV(csvFile) {

}

function saveToCSV(sourceData, targetFileName) {

}

function parseJSONData() {

}

function printJSONData() {

}

function saveToJSON(sourceData, targetFileName) {
}
