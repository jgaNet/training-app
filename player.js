function Player(user, position, game) {
    var player = this;
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

    this.user.socket.on("end", function(){
        player.game.finished();
    });

    this.user.socket.on("disconnect", function (){
        player.leaveGame();
    });
}

Player.prototype.leaveGame = function () {
    this.sendToOther("leave game", {name : this.user.name});
    this.game.removePlayer(this);
};

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