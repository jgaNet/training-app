var _ = require('underscore');

function User(options, lobby) {
    this.lobby = options.lobby;
    this.socket = options.socket;
    this.name = options.name || "anonymous";
    this.inGame = false;
    this.connection();
}

User.prototype.connection = function() {
    var user = this;
    var lobby = this.lobby;

    this.socket.on('disconnect', function() {
        user.lobby.removeUser(user);
        user.socket.broadcast.emit('user leave', {
            id: user.socket.id
        });
    });

    this.socket.on("user name", function(name) {
        lobby.users[user.socket.id].name = name
        for (var i in lobby.users) {
            lobby.sendToAll(user, 'add user', {
                name: lobby.users[i].name,
                id: lobby.users[i].socket.id
            });
        }
    });

    this.socket.on("join game", function() {
        user.createOrEnterInGame();
    });

    this.socket.on("leave lobby", function() {
        user.leaveLobby();
    });
};

User.prototype.createOrEnterInGame = function () {
    var gameNotFull = _.map(this.lobby.games, function(index, value){
        if(!value.full){
            return index;
        }
    });

    if(gameNotFull.length !== 0){
        this.enterInGame(gameNotFull[0])
    }else{
        var game = this.lobby.createGame();
        this.enterInGame(game)
    }

};

User.prototype.enterInGame = function (game) {
    this.leaveLobby();
    game.addPlayer(this);
};

User.prototype.leaveLobby = function () {
    this.socket.leave("lobby");
};



module.exports = User;