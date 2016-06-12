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

io.on('connection', function (socket) {
    socket.on('mapClick', function (map) {
        console.log("Object spotted at { "
                    + map.lat + ", " + map.lng + " }");
    });
    socket.on('Device Located', function(lat, lng) {
        console.log("Device at : [" + lat + ", " + lng + "]");
    });
    socket.on('Alert', function(lat, lng) {

    });

    /**
     * Predict the next set of global points using linear regression
     * @param:[ [Lat,Lng] ... [Lat, Lng] ] data
     */
    socket.on('LatLng data ready', function(coordinates) {
        var regression = ss.linearRegression(coordinates);
        var regressionFunction = ss.linearRegressionLine(regression);

        // Set up the starting and ending X coordinates
        var regressionStartX = coordinates[0][0];
        var regressionEndX = coordinates[coordinates.length - 1][0];

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

    /**
     * Predict the next set of cartesian points using linear regression
     * @param: [ [x,y] ... [x,y] ] coordinate data
     */
    socket.on('Cartesian Conversion', function(data) {
        var result = ss.linearRegression(data);
        //console.log("Regression points on cartesian coordinates ...");
        //socket.emit('Regression computed', result);
        //socket.emit('Cartesian line', result);
    });

    socket.on('disconnect', function () {
        console.log("Connection closed");
    });
});
