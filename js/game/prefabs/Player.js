/**
 * Created by joelsaxton on 11/10/14.
 */

var Player = function(main, x, y, frame){

    this.main = main;
    this.playerScale = main.GAME_SCALE;
    var key = 'player';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.anchor.setTo(0.5);
    this.scale.setTo(this.playerScale * 1.8);

    // Ultimate max values for improvable ship params
    this.MAXENGINE = 10;
    this.MAXHEALTH = 1000;
    this.MAXCHARGE = 1000;

    this.SLINGSHOT_MULTIPLIER = 6;
    this.TURNRATE_INCREMENT = 0.25;
    this.THRUST_INCREMENT = this.playerScale * 20;
    this.VELOCITY_INCREMENT = this.playerScale * 240;
    this.CHARGE_INCREMENT = 100;
    this.HEALTH_INCREMENT = 100;

    // Mutable limits based on game progress
    this.ENGINE = 1;
    this.VELOCITY = this.playerScale * this.ENGINE * 3000;
    this.SLINGSHOT_VELOCITY = this.VELOCITY * this.SLINGSHOT_MULTIPLIER;
    this.THRUST = this.playerScale * this.ENGINE * 8;
    this.HEALTH = 10;
    this.CHARGE = 100;
    this.TURNRATE = this.ENGINE;

    this.health = this.HEALTH;
    this.charge = this.CHARGE;
    this.MISSILESCALE = this.playerScale * 0.4;
    this.LASERSCALE = this.playerScale * 1.6;
    this.NUKESCALE = this.playerScale * 0.5;

    this.MAX_MISSILES = 10;
    this.MAX_NUKES = 3;
    this.ENGINE_COST_MULTIPLIER = 1.5;
    this.WARP_DISCHARGE = 0.2;
    this.SHIELD_DISCHARGE = 4;
    this.MINSAFEWARPDISTANCE = this.playerScale * 3200;
    this.WARPVELOCITY = this.VELOCITY * 10;
    this.RELOAD_INTERVAL = 500;
    this.RECHARGE_INTERVAL = 50;
    this.WARP_INTERVAL = 1000; // @todo fix later
    this.LASER_DISCHARGE = 34;
    this.shieldStrength = this.CHARGE;
    this.warpDrive = this.CHARGE;
    this.warpModifier = 5;
    this.isAlive = true;
    this.isReloaded = true;
    this.isWarping = false;
    this.isShielded = false;
    this.game.physics.arcade.enableBody(this);
    this.body.bounce.set(1);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.isDocked = true;
    this.isDisembarking = false;
    this.nukes = 0;
    this.missiles = 0;
    this.hasShields = false;
    this.hasWarpDrive = false;
    this.selectedWeapon = 'laser';
    this.aliensKilled = 0;
    this.cash = 3000;
    this.inGravitationalField = false;
    this.SLINGSHOT_SLOW_RATE = 0.99; // @todo revisit slowdown

    // Upgrades
    this.engineCost = this.ENGINE * 1000;
    this.nukeCost = 2000;
    this.missileCost = 200;
    this.shieldCost = 6000;
    this.warpCost = 8000;
    this.chargeCost = 1000;
    this.armorCost = 1000;

    // Set projectile pools
    this.lasers = this.game.add.group();
    this.missilegroup = this.game.add.group();
    this.missilegroup.setAll('anchor.x', 0.5);
    this.missilegroup.setAll('anchor.y', 0.5);

    // Set player map
    this.map = this.game.add.sprite(this.game.width - this.game.mapSize - this.game.mapOffset + parseInt(this.x * this.game.mapGameRatio), parseInt(this.y * this.game.mapGameRatio) + this.game.mapOffset, 'playermap');
    this.map.fixedToCamera = true;
    this.map.anchor.setTo(0.5);
    this.map.scale.setTo(3);

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

Player.prototype.upgradeShip = function(part) {
    switch (part) {
        case 'engine':
            if (this.cash >= this.engineCost && this.ENGINE < this.MAXENGINE) {
                this.cash -= this.engineCost;
                this.ENGINE++;
                this.THRUST += this.THRUST_INCREMENT;
                this.TURNRATE += this.TURNRATE_INCREMENT;
                this.VELOCITY += this.VELOCITY_INCREMENT;
                this.SLINGSHOT_VELOCITY = this.VELOCITY * this.SLINGSHOT_MULTIPLIER;
                this.engineCost = Math.floor(this.engineCost * this.ENGINE_COST_MULTIPLIER); // @todo revisit
            }
            break;
        case 'charge':
            if (this.cash >= this.chargeCost && this.CHARGE < this.MAXCHARGE) {
                this.cash -= this.chargeCost;
                this.CHARGE += this.CHARGE_INCREMENT;
                this.charge += this.CHARGE_INCREMENT;
            }
            break;
        case 'health':
            if (this.cash >= this.armorCost) {
                this.cash -= this.armorCost;
                if (this.HEALTH < this.MAXHEALTH) {
                    this.HEALTH += this.HEALTH_INCREMENT;
                }
                if (this.health < this.HEALTH) {
                    this.health += this.HEALTH_INCREMENT;
                    if (this.health > this.HEALTH) {
                        this.health = this.HEALTH;
                    }
                }
            }
            break;
        case 'missile':
            if (this.cash >= this.missileCost && this.missiles < this.MAX_MISSILES) {
                this.missiles++;
                this.cash -= this.missileCost;
            }
            break;
        case 'nuke':
            if (this.cash >= this.nukeCost && this.nukes < this.MAX_NUKES) {
                this.nukes++;
                this.cash -= this.nukeCost;
            }
            break;
        case 'shield':
            if (this.cash >= this.shieldCost) {
                this.hasShields = true;
                this.cash -= this.shieldCost;
            }
            break;
        case 'warp':
            if (this.cash >= this.warpCost) {
                this.hasWarpDrive = true;
                this.cash -= this.warpCost;
            }
            break;
    }
};

Player.prototype.updateWeapons = function() {

    this.lasers.forEach(function (laser) {
        if (laser) {
            if (laser.lifespan < this.game.time.now) {
                laser.kill();
            }
        }
    }, this);

    this.missilegroup.forEach(function (missile) {
        if (missile) {
            // Calculate the angle from the missile to the mouse cursor game.input.x
            // and game.input.y are the mouse position; substitute with whatever
            // target coordinates you need.

            var targetAngle = 0;

            if (this.main.alien && !this.main.alien.isInvisible) {
                targetAngle = this.game.math.angleBetween(
                    missile.x, missile.y,
                    this.main.alien.x, this.main.alien.y
                );
            }


            // Add wobble effect
            targetAngle += this.game.math.degToRad(missile.wobble);

            // Accelerate missile then lock on and turn to find enemy
            if (missile.speed < missile.MAX_SPEED) {
                missile.speed += missile.thrust;
            } else {
                // Gradually (this.TURN_RATE) aim the missile towards the target angle
                if (missile.rotation !== targetAngle) {
                    // Calculate difference between the current angle and targetAngle
                    var delta = targetAngle - missile.rotation;

                    // Keep it in range from -180 to 180 to make the most efficient turns.
                    if (delta > Math.PI) delta -= Math.PI * 2;
                    if (delta < -Math.PI) delta += Math.PI * 2;

                    if (delta > 0) {
                        // Turn clockwise
                        missile.angle += missile.TURN_RATE;
                    } else {
                        // Turn counter-clockwise
                        missile.angle -= missile.TURN_RATE;
                    }

                    // Just set angle to target angle if they are close
                    if (Math.abs(delta) < this.game.math.degToRad(missile.TURN_RATE)) {
                        missile.rotation = targetAngle;
                    }
                }
            }

            missile.body.velocity.x = Math.cos(missile.rotation) * missile.speed;
            missile.body.velocity.y = Math.sin(missile.rotation) * missile.speed;

            if (missile.lifespan < this.game.time.now) {
                this.main.detonate(missile, 50, false, 'destroy');
            }
            if (missile.launchtime < this.game.time.now) {
                missile.animations.play('missile-cruise', 20, true);
            }
        }
    }, this);
};