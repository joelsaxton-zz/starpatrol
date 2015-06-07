/**
 * Created by joelsaxton on 11/10/14.
 */

var Player = function(main, x, y, frame){
    this.playerScale = main.GAME_SCALE;
    var key = 'player';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);
    this.anchor.setTo(0.5);
    this.scale.setTo(this.playerScale * 1.6);
    this.MAXHEALTH = 100;
    this.MAXCHARGE = 100;
    this.MAXTURNINCREMENT = 0.1;
    this.MAXTURNRATE = 4;
    this.MINTURNRATE = 0.8;
    this.WARP_DISCHARGE = 0.2;
    this.SHIELD_DISCHARGE = 4;
    this.MAXVELOCITY = this.playerScale * 3500;
    this.WARPVELOCITY = this.playerScale * 16;
    this.MAXTHRUST = this.playerScale * 50;
    this.health = this.MAXHEALTH;
    this.charge = this.MAXCHARGE;
    this.thrust = this.MAXTHRUST;
    this.turnRate = 0;
    this.maxTurnRate = this.MAXTURNRATE;
    this.turnIncrement = this.MAXTURNINCREMENT;
    this.maxVelocity = this.MAXVELOCITY;
    this.shieldStrength = this.MAXCHARGE;
    this.warpDrive = this.MAXCHARGE;
    this.warpModifier = 5;
    this.isAlive = true;
    this.isReloaded = true;
    this.isBurning = false;
    this.isWarping = false;
    this.isShielded = false;
    main.game.physics.arcade.enableBody(this);
    this.body.bounce.set(0.8);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.begin = true;
    this.nukes = 0;
    this.missiles = 0;
    this.hasShields = false;

    // Set player map
    this.map = main.game.add.sprite(main.width - main.mapSize - main.mapOffset + parseInt(this.x * main.mapGameRatio), parseInt(this.y * main.mapGameRatio) + main.mapOffset, 'playermap');
    this.map.fixedToCamera = true;
    this.map.anchor.setTo(0.5);
    this.map.scale.setTo(2);

    // Set player animations
    this.animations.add('drift', [0]);
    this.animations.add('shield', [1]);
    this.animations.play('drift', 20, true);
    this.map.animations.add('tracking', [0,1]);
    this.map.animations.play('tracking', 10, true);

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.onRevived = function() {
    this.health = this.MAXHEALTH;
    this.turnIncrement = this.MAXTURNINCREMENT;
    this.maxVelocity = this.MAXVELOCITY;
    this.maxTurnRate = this.MAXTURNRATE;
    this.thrust = this.MAXTHRUST;
    this.isBurning = false;
    this.warpDrive = this.MAXCHARGE;
};