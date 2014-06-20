var socket = io('/lobby');

socket.on('add user', function(data){
    if($(".playerList").find(".player-"+data.id).length === 0){
        $(".playerList").append('<div class="player-'+data.id+'">'+data.name+'</div>');  
    }
});

socket.on('user leave', function(data){
    $(".playerList").find(".player-"+data.id).remove();
});



$(document).ready(function(){
    var name = prompt("Quel est ton nom ?");
    socket.emit("user name", name);

    $(".new-game").on("click", function(){
        $(".lobby").hide();
        socket.emit("leave lobby");
        $(".game").show();
        socket.emit("join game");
    });

    var game = new Game();

    socket.on('new Player', function(data){
        game.addPlayer(data, data.self);
    });

    socket.on('opponent position', function(y){
        game.opponent.position.y = y;
    });

});

function Player(name, position, game) {
    this.game = game;
    this.height = 50;
    this.width = 5;
    this.position = {
        x : (position) ? 675 : 25,
        y : 0
    }
}

Player.prototype.render = function () {
    this.game.context.beginPath();
    this.game.context.rect(this.position.x - this.width /2 , this.position.y - this.height/2, this.width, this.height);
    this.game.context.fillStyle = "red";
    this.game.context.fill();
}

function Game() {
    this.players = [];
    this.timeSpent = 0;
    this.$canvas = $("canvas");
    this.canvas = this.$canvas[0];
    this.context = this.canvas.getContext("2d");
    this.controls();
    this.loop();
}

Game.prototype.addPlayer = function(player, self) {
    var player = new Player(player.name, player.position, this);
    this.players.push(player);
    if(self){
        this.self = player;
        this.self.socket = socket;
    }else{
        this.opponent = player;
    }
};

Game.prototype.controls = function () {
    var game = this;
    this.$canvas.on("mousemove", function(e){
        game.self.position.y = e.offsetY;
        game.self.socket.emit("self y position", game.self.position.y);
    });
};

Game.prototype.loop = function (time) {
    var game = this;
    window.requestAnimationFrame(function (time){
        game.timeSpent = time;
        game.render();
        for(var i = 0; i < game.players.length; i++){
            game.players[i].render();
        }
        game.loop(time);
    });
};

Game.prototype.render = function() {
    this.context.beginPath();
    this.context.rect(0,0,this.canvas.width,this.canvas.height);
    this.context.fillStyle="green";
    this.context.fill();
};

