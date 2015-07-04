/**
 * Created by joelsaxton on 11/8/14.
 */
var Scoreboard = function(game){
    Phaser.Group.call(this, game);
}

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score, gameOverSound, explosionSound, victory){
    var bmd, background, scoreText, highScoreText, newHighScoreText, startText;
    bmd = this.game.add.bitmapData(this.game.width, this.game.height);
    bmd.ctx.fillStyle = '#000';
    bmd.ctx.fillRect(0,0, this.game.width, this.game.height);

    background = this.game.add.sprite(0,0, bmd);
    background.alpha = 0.5;

    this.add(background);

    var isNewHighScore = false;
    var highScore = localStorage.getItem('highscore');
    if(!highScore || highScore < score) {
        isNewHighScore = true;
        highScore = score;
        localStorage.setItem('highscore', highScore);
    }

    this.y = this.game.height;

    scoreText = this.game.add.bitmapText(0, this.game.world.centerY, 'minecraftia', 'Your Score: ' + score + ' aliens killed', 16);
    scoreText.x = this.game.width/2 - (scoreText.textWidth /2);
    this.add(scoreText);

    highScoreText = this.game.add.bitmapText(0, this.game.world.centerY + 50, 'minecraftia', 'Your High Score: ' + highScore + ' aliens killed', 16);
    highScoreText.x = this.game.width/2 - (highScoreText.textWidth /2);
    this.add(highScoreText);

    startText = this.game.add.bitmapText(0, this.game.world.centerY + 100, 'minecraftia', 'Click to play again!', 14);
    startText.x = this.game.width/2 - (startText.textWidth /2);
    this.add(startText);

    if(isNewHighScore) {
        newHighScoreText = this.game.add.bitmapText(0,100, 'minecraftia', 'New High Score!', 16);
        newHighScoreText.tint = 0x4ebef7; // '#4ebef7'
        newHighScoreText.x = scoreText.x + scoreText.textWidth + 40;
        newHighScoreText.angle = 45;
        this.add(newHighScoreText);
    }

    explosionSound.play('', 0, 0.5, false, true);

    if (victory){
        this.game.add.tween(this).to({y:0}, 500, Phaser.Easing.Bounce.Out, true).onComplete.add(function(){
            this.win = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 100, 'scoreboard-win');
            this.win.anchor.setTo(0.5);
            gameOverSound.play('', 0, 0.5, false, true);
        }, this);
    } else {
        this.game.add.tween(this).to({y:0}, 500, Phaser.Easing.Bounce.Out, true).onComplete.add(function(){
            this.fail = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 100, 'scoreboard-fail');
            this.fail.anchor.setTo(0.5);
            gameOverSound.play('', 0, 0.5, false, true);
        }, this);
    }

    this.game.input.onDown.addOnce(this.restart, this);
};

Scoreboard.prototype.restart = function(){
    this.game.state.start('Game', true, false);
};