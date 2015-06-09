/**
 * Created by joelsaxton on 11/10/14.
 */

var Player = function(main, x, y, frame){

    this.playerScale = main.GAME_SCALE;
    var key = 'player';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.anchor.setTo(0.5);
    this.scale.setTo(this.playerScale * 2.2);

    // Ultimate max values for improvable ship params
    this.MAXHEALTH = 1000;
    this.MAXCHARGE = 1000;
    this.MAXVELOCITY = this.playerScale * 10000;
    this.MAXTHRUST = this.playerScale * 200;

    // Mutable limits based on game progress
    this.VELOCITY = this.playerScale * 2000;
    this.THRUST = this.playerScale * 20;
    this.HEALTH = 100;
    this.CHARGE = 100;

    this.health = this.HEALTH;
    this.charge = this.CHARGE;
    this.thrust = this.THRUST;
    this.MISSILESCALE = this.playerScale * 0.4;
    this.LASERSCALE = this.playerScale * 0.3;
    this.NUKESCALE = this.playerScale * 0.5;
    this.MAXTURNINCREMENT = 0.1;
    this.MAXTURNRATE = 4;
    this.MINTURNRATE = 0.8;
    this.WARP_DISCHARGE = 0.2;
    this.SHIELD_DISCHARGE = 4;
    this.MINSAFEWARPDISTANCE = this.playerScale * 3200;
    this.WARPVELOCITY = this.VELOCITY * 10;
    this.RELOAD_INTERVAL = 500;
    this.RECHARGE_INTERVAL = 50;
    this.WARP_INTERVAL = 2500;
    this.LASER_DISCHARGE = 34;
    this.turnRate = 0;
    this.maxTurnRate = this.MAXTURNRATE;
    this.turnIncrement = this.MAXTURNINCREMENT;
    this.shieldStrength = this.CHARGE;
    this.warpDrive = this.CHARGE;
    this.warpModifier = 5;
    this.isAlive = true;
    this.isReloaded = true;
    this.isWarping = false;
    this.isShielded = false;
    this.game.physics.arcade.enableBody(this);
    this.body.bounce.set(0.8);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.begin = true;
    this.nukes = 3;
    this.missiles = 20;
    this.hasShields = true;
    this.hasWarpDrive = true;
    this.selectedWeapon = 'laser';
    this.aliensKilled = 0;
    this.cash = 0;

    // Set projectile pools
    this.lasers = this.game.add.group();
    this.missilegroup = this.game.add.group();
    this.missilegroup.setAll('anchor.x', 0.5);
    this.missilegroup.setAll('anchor.y', 0.5);

    // Set player map
    this.map = this.game.add.sprite(this.game.width - this.game.mapSize - this.game.mapOffset + parseInt(this.x * this.game.mapGameRatio), parseInt(this.y * this.game.mapGameRatio) + this.game.mapOffset, 'playermap');
    this.map.fixedToCamera = true;
    this.map.anchor.setTo(0.5);
    this.map.scale.setTo(2);

    // Set player animations
    this.animations.add('thrust', [0,1]);
    this.animations.add('thrust-lights', [2,3]);
    this.animations.add('shield', [4,5]);
    this.animations.add('warp', [6,7]);
    this.animations.add('drift', [8,9]);
    this.animations.add('drift-lights', [10,11]);
    this.animations.play('drift', 20, true);
    this.map.animations.add('tracking', [0,1]);
    this.map.animations.play('tracking', 10, true);

    // Sounds
    this.missileSound = this.game.add.audio('missile');
    this.laserSound = this.game.add.audio('laser');
    this.nukeSound = this.game.add.audio('nuke');
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.fireWeapon = function() {
    switch (this.selectedWeapon) {
        case 'laser':
            this.fireLaser();
            break;
        case 'nuke':
            this.fireNuke();
            break;
        case 'missile':
            this.fireMissile();
            break;
    }
};

Player.prototype.fireMissile = function () {
    if (this.isReloaded && this.missiles > 0) {
        this.missiles--;
        this.missileSound.play('', 0, 0.4, false, true);
        this.createMissile(this.x, this.y, this.angle);
        this.isReloaded = false;
    }
};

Player.prototype.fireLaser = function () {
    if (this.isReloaded && this.charge >= this.LASER_DISCHARGE) {
        this.charge -= this.LASER_DISCHARGE;
        this.laserSound.play('', 0, 0.4, false, true);
        this.createLaser(this.x, this.y, this.angle);
        this.isReloaded = false;
    }
};

Player.prototype.fireNuke = function () {
    if (this.isReloaded && this.nukes > 0) {
        this.nukes--;
        this.nukeSound.play('', 0, 0.6, false, true);
        this.createNuke(this.x, this.y, this.angle);
        this.isReloaded = false;
    }
};

Player.prototype.createLaser = function(x, y, angle) {
    var laser = new Laser(this.game, this.LASERSCALE, x, y, angle);
    this.lasers.add(laser);
    laser.reset(this.x, this.y);
    laser.revive();
};

Player.prototype.createMissile = function(x, y, angle) {
    var missile = new Missile(false, this.game, this.MISSILESCALE, x, y, angle);
    missile.animations.add('missile-launch', [0,1,0,1,0,1,2,1,2,3,2,3,4,5,4,5]);
    missile.animations.add('missile-cruise', [6,7,6]);
    this.missilegroup.add(missile);
    missile.checkWorldBounds = true;
    missile.reset(this.x, this.y);
    missile.revive();
    missile.animations.play('missile-launch', 8, true);
};

Player.prototype.createNuke = function(x, y, angle) {
    var nuke = new Missile(true, this.game, this.NUKESCALE, x, y, angle);
    nuke.animations.add('missile-launch', [0,1,0,1,0,1,2,1,2,3,2,3,4,5,4,5]);
    nuke.animations.add('missile-cruise', [6,7,6]);
    this.missilegroup.add(nuke);
    nuke.checkWorldBounds = true;
    nuke.reset(this.x, this.y);
    nuke.revive();
    nuke.animations.play('missile-launch', 8, true);
};