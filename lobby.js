var User = require('./user');
var Game = require("./game");
var _ = require('underscore');

function Lobby() {
    this.namespace = false;
    this.users = {};
    this.games = [];
}

Lobby.prototype.createUser = function(options) {
    if (typeof this.users[options.socket.id] === "undefined") {
        this.users[options.socket.id] = new User(options);
    }
};

Lobby.prototype.removeUser = function(player) {
    delete this.users[player.socket.id]
};

Lobby.prototype.connection = function() {
    var lobby = this;

    this.namespace.on('connection', function(socket) {
        socket.join("lobby");

        lobby.createUser({
            socket: socket,
            lobby: lobby
        });
    });
};

Lobby.prototype.sendToAll = function (player, event, data) {
    player.socket.emit(event, data);
    player.socket.broadcast.to("lobby").emit(event, data);
};

Lobby.prototype.createGame = function () {
    var newGame = new Game("game-"+this.games.length);
    this.games.push(newGame);
    return newGame;
};

module.exports = Lobby