var path  = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/src' +'/index.html'));
    app.use(express.static('src'));
});

io.on('connection', function (socket) {
    socket.on('mapClick', function (e) {
        console.log(e.latlng);
    });
    socket.on('disconnect', function () {
        console.log("Connection closed");
    })
});

app.listen(8080, function() {
    console.log("App listening on port 8080");
});
server.listen(3000, function() {
     console.log("Server listening on port 3000");
});
