var _ = require('underscore');
var Player = require("./player");

function Game (room) {
    this.room = room;
    this.players = {};
    this.maxPlayer = 2;
    this.full = false;
    this.stackEnd = 0;
}

Game.prototype.addPlayer = function(user) {
    var game = this;
    user.socket.join(this.room);

    if(_.size(this.players) > 0){
        for(var i in this.players){
            user.socket.emit("new Player", {
                name : this.players[i].user.name,
                socket : this.players[i].user.socket.id,
                position : this.players[i].position,
                self : false
            });
        }
    }

    if(_.size(this.players) < this.maxPlayer){
        var firstPlayer;
        var otherPosition;
        for (var k in this.players) {
            if(this.players[k].position === 1){
                otherPosition = 0;
            }else{
                otherPosition = 1;
            }
            break
        }
        var position = (_.size(this.players) === 0) ? 0 : otherPosition; 
        this.players[user.socket.id] = new Player(user, position, this);

        this.players[user.socket.id].user.socket.on("self y position", function (y){
            game.players[user.socket.id].sendToOther("opponent position", y);
        });

        if(_.size(this.players) == 2) {
            this.full = true;
            game.sendToAll("game begin", {});
        }
    }
};

Game.prototype.removePlayer = function (player) {
    this.full = false;
    delete this.players[player.user.socket.id];
};

Game.prototype.finished = function() {
    this.stackEnd++;
    var game = this;
    if(this.stackEnd == this.maxPlayer){
        this.stackEnd = 0;
        setTimeout(function(){
            var sign = [1, -1];
            game.sendToAll("game restart", {
                speed : {
                    x : sign[Math.floor(Math.random()*2)]*Math.ceil(Math.random()*3 + 1),
                    y : sign[Math.floor(Math.random()*2)]*Math.ceil(Math.random()*3 + 1)
                }
            });
        }, 2000);
    }
};

Game.prototype.sendToAll = function(event, data) {
    for(var i in this.players){
        this.players[i].send(event, data);
    }
};

module.exports = Game;