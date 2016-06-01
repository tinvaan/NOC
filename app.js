var path  = require('path');
var express = require('express');
var app = express();
//var server = require('http').Server(app);
var server = app.listen(3000, function() {
    console.log("App listening on port 3000");
});
var io = require('socket.io')(server);

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
    socket.on('Latitude', function(lat) {
        console.log("Latitude : " + lat);
    });
    socket.on('Longitude', function(lng) {
        console.log("Longitude : " + lng);
    });
    socket.on('disconnect', function () {
        console.log("Connection closed");
    });
});
