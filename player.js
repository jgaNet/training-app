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
        var sign = [1, -1];
        player.sendToAll("game restart", {
            speed : {
                x : sign[Math.floor(Math.random()*2)]*Math.ceil(Math.random()*3 + 1),
                y : sign[Math.floor(Math.random()*2)]*Math.ceil(Math.random()*3 + 1)
            }
        });
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