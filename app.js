var path  = require('path');
var express = require('express');
var app = express();
var server = app.listen(3000, function() {
    console.log("App listening on port 3000");
});
var io = require('socket.io')(server);
var ss = require('simple-statistics');
var alert  = require(__dirname + '/alert.js'),
    pathjs = require(__dirname + '/src/js' + '/path.js');

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
        var locationAdded = alert.newLocation(lat, lng);
        if (locationAdded) {
            if ( alert.proximity(lat, lng) ) {
                socket.emit('Alert');
                socket.emit('Alert animation', lat, lng);
            }
        }
    });

    /**
     * Predict the next set of global points using linear regression
     * @param:[ [Lat,Lng] ... [Lat, Lng] ] data
     */
    socket.on('LatLng data ready', function(remoteCoordinates) {
        alert.reg(remoteCoordinates);
        //socket.emit('Global line', regressionLine);
    });

    socket.on('Alert', function() {
        console.log("Alert situation. Expecting remote device to respond");
    });

    socket.on('disconnect', function () {
        console.log("Connection closed");
        alert.print();
    });
});
