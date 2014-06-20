var _ = require('underscore');
var Player = require("./player");

function Game (room) {
    this.room = room;
    this.players = {};
    this.maxPlayer = 2;
    this.full = false;
}

Game.prototype.addPlayer = function(user) {
    var game = this;
    user.socket.join(this.room);

    if(_.size(this.players) > 0){
        for(var i in this.players){
            user.socket.emit("new Player", {
                name : this.players[i].user.name,
                socket : this.players[i].user.socket.id,
                self : false
            });
        }
    }

    if(_.size(this.players) <= this.maxPlayer){
        var position = (_.size(this.players) === 0) ? 0 : 1; 
        this.players[user.socket.id] = new Player(user, position, this);

        this.players[user.socket.id].user.socket.on("self y position", function (y){
            game.players[user.socket.id].sendToOther("opponent position", y);
        });

    }else{
        this.full = true;
    }
};

Game.prototype.sendToAll = function(event, data) {
    for(var i = 0; i < this.players.length; i++){
        this.players[i].send(event, data);
    }
};

module.exports = Game;