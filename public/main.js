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

    socket.on('game restart', function(data){
        game.restart(data.speed);
    });

    socket.on('leave game', function(data){
        console.log(game.players);
        for(var i = 0; i < game.players.length; i++){
            if(data.name === game.players[i].name){
                game.players.splice(i, 1);
            }
        }

    });

});

function Player(name, position, game) {
    this.game = game;
    this.name = name;
    this.id = position;
    this.height = 50;
    this.width = 5;
    this.offsetX = 20;
    this.position = {
        x : (position) ? 700 - (this.width /2 + this.offsetX) : this.width /2 + this.offsetX,
        y : 0
    }
    this.score = 0;
    this.$score = $(".player"+this.id).find(".score");
    this.$score.html(this.score);
    $(".player"+this.id).find(".name").html(name);
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
    var detectX = Math.abs((ball.position.x + (sign*ball.radius / 2)) - this.position.x - offsetX) < 10
    var detectY = ball.position.y - this.position.y > -ball.radius*2 && ball.position.y - this.position.y < this.height + ball.radius*2;

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

Ball.prototype.collision = function () {
    for(var i = 0; i < this.game.players.length; i++){
        var playerCollision = this.game.players[i].touchBall(this);
        if(playerCollision.test){
            this.speed.x = -1*this.speed.x;
        }
    }

    if((this.position.y - this.radius) < 0){
        this.speed.y = this.speedAbs;
    }

    if((this.position.y - this.radius) >= this.game.canvas.height-(this.radius*2)){
        this.speed.y = -this.speedAbs;
    }



    if(this.position.x < 0 || this.position.x > this.game.canvas.width){
        if(this.position.x < 1){
            this.game.players[1].score++;
            this.game.players[1].$score.html(this.game.players[1].score);
        }

        if(this.position.x > this.game.canvas.width - 1){
            this.game.players[0].score++;
            this.game.players[0].$score.html(this.game.players[0].score);
        }
        socket.emit("end");
        return true;
    }

    return false;
};

k = 0;
Ball.prototype.render = function () {

    if(k < 1){
        k++;
    }else{
        this.position.x += this.speed.x*this.game.loopInterval/10;
        this.position.y += this.speed.y*this.game.loopInterval/10;
    }
    


    this.game.context.beginPath();
    this.game.context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    this.game.context.fillStyle = 'yellow';
    this.game.context.fill();
};

function Game() {
    this.players = [];
    this.timeSpent = 0;
    this.loopInterval = 0;
    this.$canvas = $("canvas");
    this.canvas = this.$canvas[0];
    this.context = this.canvas.getContext("2d");
    this.controls();
    this.ball = new Ball(this);
}

Game.prototype.launch = function () {
    this.loop(0);
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


Game.prototype.restart = function (speed) {
    k = 0;
    this.ball.speedAbs = Math.sqrt(speed.x*speed.x + speed.y*speed.y);
    this.ball.speed = {
        x : speed.x,
        y : speed.y
    };
    this.ball.position.x = this.canvas.width / 2;
    this.ball.position.y = this.canvas.height / 2
    this.loop(0);
}

Game.prototype.controls = function () {
    var game = this;
    this.$canvas.on("mousemove", function(e){
        game.self.position.y = e.offsetY - game.self.height/2;
        game.self.socket.emit("self y position", game.self.position.y);
    });
};

Game.prototype.loop = function (time) {
    var game = this;
    game.requestId = window.requestAnimationFrame(function (time){
        game.loopInterval = time - game.timeSpent;
        game.timeSpent = time;
        game.render();
        game.ball.render();
        for(var i = 0; i < game.players.length; i++){
            game.players[i].render();
        }
        var end = game.ball.collision();
        if(!end){
            game.loop(time);
        }
        
    });
};


Game.prototype.render = function() {
    this.context.beginPath();
    this.context.rect(0,0,this.canvas.width,this.canvas.height);
    this.context.fillStyle="green";
    this.context.fill();
};

