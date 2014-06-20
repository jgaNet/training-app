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

    socket.on('game begin', function(){
        game.launch();
    });

});

function Player(name, position, game) {
    this.game = game;
    this.height = 50;
    this.width = 5;
    this.offsetX = 20;
    this.position = {
        x : (position) ? 700 - (this.width /2 + this.offsetX) : this.width /2 + this.offsetX,
        y : 0
    }
}

Player.prototype.render = function () {
    this.game.context.beginPath();
    this.game.context.rect(this.position.x , this.position.y, this.width, this.height);
    this.game.context.fillStyle = "red";
    this.game.context.fill();
};

Player.prototype.touchBall = function (ball) {
    var sign = Math.abs(ball.speed.x)/ball.speed.x;
    var offsetX = (sign > 0) ? 0 : this.width;
    var detectX = Math.abs((ball.position.x + (sign*ball.radius / 2)) - this.position.x - offsetX) < 1
    var detectY = Math.abs(ball.position.y - this.position.y) > - ball.radius*2 && Math.abs(ball.position.y - this.position.y) < this.height + ball.radius*2;

    return {
        test : detectX && detectY,
        pourcent : ball.position.y - this.position.y
    }
};


function Ball(game) {
    this.game = game;
    this.radius = 10;
    this.speedAbs = 2;
    this.speed = {
        x : this.speedAbs,
        y : this.speedAbs 
    };
    this.position = {
        x : 100,
        y : 100
    }
}

Ball.prototype.render = function () {
    if(this.game.launched){
        this.position.x += this.speed.x;
        this.position.y = this.position.y + this.speed.y;

        this.game.context.beginPath();
        this.game.context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        this.game.context.fillStyle = 'yellow';
        this.game.context.fill();
    }
};

function Game() {
    this.players = [];
    this.timeSpent = 0;
    this.$canvas = $("canvas");
    this.canvas = this.$canvas[0];
    this.context = this.canvas.getContext("2d");
    this.controls();
    this.launched = false;
    this.ball = new Ball(this);
    this.loop();
}

Game.prototype.launch = function () {
    this.launched = true;
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
        game.self.position.y = e.offsetY - game.self.height/2;
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
        if(game.launched){
            game.detectCollision();
            game.ball.render();
        }
        game.loop(time);
    });
};

Game.prototype.detectCollision = function () {
    for(var i = 0; i < this.players.length; i++){
        var playerCollision = this.players[i].touchBall(this.ball);
        if(playerCollision.test){
            this.ball.speed.x = -1*this.ball.speed.x;
        }

        if(this.ball.position.x < 0 || this.ball.position.x > this.canvas.width){
            this.ball.position.x = this.canvas.width / 2;
            this.ball.position.y = this.canvas.height / 2
            console.log("perdu");
        }

        if((this.ball.position.y - this.ball.radius) < 0){
            this.ball.speed.y = this.ball.speedAbs;
        }

        if((this.ball.position.y - this.ball.radius) >= this.canvas.height-(this.ball.radius*2)){
            this.ball.speed.y = -this.ball.speedAbs;
        }

        //Math.sqrt((this.ball.position.x - this.players[i].position.x)*(this.ball.position.x - this.players[i].position.x))+((this.ball.position.y - this.players[i].position.y)*(this.ball.position.y - this.players[i].position.y)))
    }
};

Game.prototype.render = function() {
    this.context.beginPath();
    this.context.rect(0,0,this.canvas.width,this.canvas.height);
    this.context.fillStyle="green";
    this.context.fill();
};

