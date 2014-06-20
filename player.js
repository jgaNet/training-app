function Player(user, position, game) {
    this.user = user;
    this.game = game;
    this.position = position;

    this.sendToOther("new Player", {
        name : this.user.name,
        socket : this.user.socket.id,
        position : this.position,
        self : false
    });

    this.send("new Player", {
        name : this.user.name,
        socket : this.user.socket.id,
        position : this.position,
        self : true
    });
}

Player.prototype.send = function(event, data) {
    this.user.socket.emit(event, data)
};

Player.prototype.sendToOther = function(event, data) {
    this.user.socket.broadcast.to(this.game.room).emit(event, data)
};

Player.prototype.sendToAll = function (event, data) {
    this.send(event, data);
    this.sendToOther(event, data);
};

module.exports = Player;