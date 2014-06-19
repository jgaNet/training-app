function Player(options, lobby) {
    this.lobby = options.lobby;
    this.socket = options.socket;
    this.name = options.name || "anonymous";
    this.connection();
}

Player.prototype.connection = function() {
    var player = this;
    var lobby = this.lobby;

    this.socket.on('disconnect', function() {
        player.lobby.removePlayer(player);
        player.socket.broadcast.emit('player leave', {
            id: player.socket.id
        });
    });

    this.socket.on("player name", function(name) {
        lobby.players[player.socket.id].name = name
        for (var i in lobby.players) {
            player.sendToAll('add player', {
                name: lobby.players[i].name,
                id: lobby.players[i].socket.id
            });
        }
    });
};

Player.prototype.sendToAll = function(event, data) {
    this.socket.emit(event, data);
    this.socket.broadcast.emit(event, data);
}


module.exports = Player;