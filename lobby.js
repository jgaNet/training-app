var Player = require('./player');
var _ = require('underscore');

function Lobby() {
    this.namespace = false;
    this.players = {};
}

Lobby.prototype.addPlayer = function(options) {
    if (typeof this.players[options.socket.id] === "undefined") {
        this.players[options.socket.id] = new Player(options);
    }
}

Lobby.prototype.removePlayer = function(player) {
    delete this.players[player.socket.id]
}

Lobby.prototype.connection = function() {
    var lobby = this;

    this.namespace.on('connection', function(socket) {
        lobby.addPlayer({
            socket: socket,
            lobby: lobby
        });
    });
}

module.exports = Lobby