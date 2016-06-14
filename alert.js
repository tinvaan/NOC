/**
 * Created by harish on 14/06/16.
 */

var app = require('./app.js');
var ss  = require('simple-statistics');

var locationData = [];
var R = 6372.795477598,                             //Radius of the earth kms
    prevLat, prevLng,
    targetLat = 9.102803, targetLng = 76.4942673;   // Location of Amrita Boys hostel

/**
 * Track the locations of the remote device
 * @param lat current latitude
 * @param lng current longitude
 * @returns {boolean}
 */
var newLocation = function addNewLocation(lat, lng) {
    var location = [];
    if (prevLat != lat && prevLng !=lng) {
        // Debug information
        console.log("Device at : [" + lat + ", " + lng + "]");

        // Store {lat,lng} data in an array
        location.splice(0, 0, lat);
        location.splice(1, 0, lng);

        locationData.push(location);
        prevLat = lat;  prevLng = lng;
        location = [];
        return true;
    } else {
        //console.log("Repeated values...");
        return false;
    }
}

/**
 * Compute the distance between @params and target point
 * @param lat latitude of the current point
 * @param lng longitude of the current point
 */
var distance = function distance(lat, lng) {
    var distance = R * Math.acos(
            Math.sin(lat) * Math.sin(targetLat) +
            Math.cos(lat) * Math.cos(targetLat) *
            Math.cos(lng - targetLng)
        );
}

/**
 * Compute the linear regression and line function
 * @param remoteCoordinates
 * @returns {*} the linear regression line function
 */
var reg = function computeRegressionLine(remoteCoordinates) {
    var regression = ss.linearRegression(remoteCoordinates);
    var regressionFunction = ss.linearRegressionLine(regression);

    // Set up the starting and ending X coordinates
    var regressionStartX = remoteCoordinates[0][0];
    var regressionEndX = remoteCoordinates[remoteCoordinates.length - 1][0];

    // Calculate the starting and ending Y coordinates
    var regressionStartY = regressionFunction(regressionStartX);
    var regressionEndY = regressionFunction(regressionEndX);

    var regressionLine = [
        [regressionStartX, regressionStartY],
        [regressionEndX, regressionEndY]
    ];
    return regressionFunction;
}

/**
 * Check for devices in close proximity to the target point
 * @param lat current latitude
 * @param lng current longitude
 * @returns {boolean} if the current location is in close
 *          proximity to the target
 */
var proximity = function checkProximity(lat, lng) {
    var Y, X = targetLat;
    var lineFunc = reg(locationData);
    Y = lineFunc(X);

    if (distance(lat, lng) == 0 || distance(X, Y) == 0) {
        return true;
    } else if ( (distance(lat, lng) > 10.0) || (distance(X, Y) > 10.0) ){
        return false;
    } else {
        return true;
    }
}

/**
 * Print the locations of the current device
 */
var print = function printRemoteDeviceLocations() {
    console.log("Printing the path of the remote device ...");
    for (index = 0; index < locationData.length; ++index) {
        console.log(locationData[index]);
    }
}

//noinspection JSAnnotator
module.exports = { newLocation, distance, proximity, print, reg };
