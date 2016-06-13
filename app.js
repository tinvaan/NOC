var path  = require('path');
var express = require('express');
var app = express();
var server = app.listen(3000, function() {
    console.log("App listening on port 3000");
});
var io = require('socket.io')(server);
var ss = require('simple-statistics');
var pathjs = require(__dirname + '/src/js' + '/path.js');

/**
 * Middleware to add CORS headers
 * References:
 * http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
 */
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST', 'OPTIONS',
                  'PUT', 'PATCH', 'DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/src' +'/index.html'));
    app.use(express.static('src'));
});

/**
 * Handle socketio events
 */
io.on('connection', function (socket) {
    socket.on('mapClick', function (map) {
        console.log("Object spotted at { "
                    + map.lat + ", " + map.lng + " }");
    });

    /**
     * Called when the location of a device is available
     */
    socket.on('Device Located', function(lat, lng) {
        // Debug information
        console.log("Device at : [" + lat + ", " + lng + "]");

        // Store {lat,lng} data in an array
        var location = [];
        location.splice(0, 0, lat);
        location.splice(1, 0, lng);

        // Emit the location to be plotted on the map
        socket.emit('Device location changed', location);
    });

    /**
     * Display an alert to at {lat,lng} if an
     * alert for {lat,lng} is received
     */
    socket.on('Alert', function(lat, lng) {
        socket.emit('Alert animation', lat, lng);
    });

    /**
     * Predict the next set of global points using linear regression
     * @param:[ [Lat,Lng] ... [Lat, Lng] ] data
     */
    socket.on('LatLng data ready', function(remoteCoordinates) {
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
        //console.log("Regression points on global coordinates ... ");
        //socket.emit('Regression computed', result);
        socket.emit('Global line', regressionLine);
    });

    socket.on('disconnect', function () {
        console.log("Connection closed");
    });
});
