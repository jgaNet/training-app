var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Lobby = require('./lobby');
var connect = require("connect");

app.use(connect.static(__dirname + '/public'))

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

var lobby = new Lobby();
lobby.namespace = io.of('/lobby');
lobby.connection();


http.listen(8080, function() {
    console.log('listening on *:8080');
});

module.exports = app;