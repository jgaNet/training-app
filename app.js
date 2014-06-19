var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Lobby = require('./lobby');

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.get('/game', function(req, res) {
    res.sendfile('game.html');
});

var lobby = new Lobby();
lobby.namespace = io.of('/lobby');
lobby.connection();

var game = io.of('/game');
game.on('connection', function(socket) {
    socket.broadcast.emit('game', {
        msg: 'Un joueur à rejoind le jeu'
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

module.exports = app;