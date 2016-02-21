/**
 * Created by joelsaxton on 11/10/14.
 */

var Ufo = function (main, player, scale, x, y, key, frame) {
    key = 'ufo';

    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(scale * 2.4);
    this.MAXHEALTH = 240;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 200;
    this.INVISIBILITY_DISCHARGE = 0.5;
    this.INVISIBILITY_DISTANCE = 2000;
    this.BULLETLOCKDISTANCE = this.alienScale * 4000;
    this.BULLETACCELERATION = this.alienScale * 6000;
    this.MAXBULLETSPEED = this.alienScale * 6000;
    this.MINBULLETDISTANCE = this.alienScale * 1000;
    this.MAXBULLETDISTANCE = this.alienScale * 8000;
    this.BULLET_DISCHARGE = 200;
    this.DEATHRAY_DISCHARGE = 120;
    this.DEATHRAY_SCALE = 0.2;
    this.MAXCANNONDISTANCE = 800;
    this.WEAPON_DAMAGE = 120;
    this.COLLISION_DAMAGE = 2;
    this.KILL_SCORE = 8000;
    this.MAXTHRUST = this.alienScale * 10;
    this.MAXVELOCITY = this.alienScale * 6000;
    this.charge = this.MAXCHARGE;
    this.deathRayCharge = this.MAXCHARGE;
    this.target = player;
    this.alive = true;
    this.game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0.8);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1.5;
    this.speed = 0;
    this.minAttackDistance = 250;
    this.isAttacking = true;
    this.isSlowing = false;
    this.hasTractorBeam = false;
    this.hasDrill = false;
    this.hasBullets = true;
    this.disappearTimer = 0;
    this.disappearInterval = 700;
    this.isInvisible = false;
    this.bullets = this.game.add.group();
    this.deathrays = this.game.add.group();
    this.hasDeathRay = true;
    this.tar = 1;

    // Animations
    this.animations.add('cruise', [0]);
    this.animations.add('disappear', [1, 2, 1, 2, 3, 2, 3]);
    this.animations.add('invisible', [4]);
    this.animations.play('cruise', 100, true);

    // Sounds
    this.invisibleSound = this.game.add.audio('invisible');
    this.bulletSound = this.game.add.audio('launchGas');
    this.fartSound = this.game.add.audio('fart');
    this.deathRaySound = this.game.add.audio('deathRay');
};

Ufo.prototype = Object.create(Phaser.Sprite.prototype);
Ufo.prototype.constructor = Ufo;
Ufo.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Ufo.prototype.die = Alien.prototype.die;
Ufo.prototype.onRevived = Alien.prototype.onRevived;
Ufo.prototype.createBullet = Alien.prototype.createBullet;
Ufo.prototype.die = Alien.prototype.die;

Ufo.prototype.update = function () {
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // DISTANCE
    var distance = this.game.physics.arcade.distanceBetween(this, this.target);

    // ATTACK
    if (this.isAttacking) {
        // Magnet speeds up
        if (this.speed < this.MAXVELOCITY) {
            this.speed += this.MAXTHRUST;
        }

        if (this.rotation !== targetAngle) {
            // Calculate difference between the current angle and targetAngle
            var delta = targetAngle - this.rotation;

            // Keep it in range from -180 to 180 to make the most efficient turns.
            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;

            if (delta > 0) {
                // Turn clockwise
                this.angle += this.turnRate;
            } else {
                // Turn counter-clockwise
                this.angle -= this.turnRate;
            }

            // Just set angle to target angle if they are close
            if (Math.abs(delta) < this.game.math.degToRad(this.turnRate)) {
                this.rotation = targetAngle;
            }
        }

        this.body.velocity.x = Math.cos(this.rotation) * this.speed;
        this.body.velocity.y = Math.sin(this.rotation) * this.speed;

        // Make invisible
        if (!this.isDisappearing && this.charge > 95 && distance <= this.INVISIBILITY_DISTANCE) {
            this.isDisappearing = true;
            this.disappearTimer = this.game.time.now + this.disappearInterval;
        }
        if (this.isDisappearing && this.disappearTimer > this.game.time.now) {
            this.animations.play('disappear', 50, true);
            this.invisibleSound.play('', 0, 1.0, false, false);
        }
        if (this.isDisappearing && this.disappearTimer < this.game.time.now) {
            this.isDisappearing = false;
            this.isInvisible = true;
        }
        if (this.isInvisible) {
            this.animations.play('invisible', 100, true);
            this.charge -= this.INVISIBILITY_DISCHARGE;
            if (this.charge <= 5) {
                this.isInvisible = false;
                this.animations.play('cruise', 100, true);
            }
        }

        // Fire blob to trap target
        if (this.charge >= this.BULLET_DISCHARGE) {
            if (distance < this.MAXBULLETDISTANCE && distance > this.MINBULLETDISTANCE) {
                this.bulletSound.play('', 0, 0.1, false, true);
                this.createBullet(this.x, this.y);
                this.charge -= this.BULLET_DISCHARGE;
            }
        }

        // Fire death ray
        if (this.deathRayCharge >= this.DEATHRAY_DISCHARGE && distance < this.MAXCANNONDISTANCE && this.rotation == targetAngle) {
            this.fireDeathRay();
        }


        // SLOW DOWN
    } else if (this.isSlowing) {

        if (this.speed > this.MAXVELOCITY * 0.5) {
            this.speed -= this.MAXTHRUST;
        } else if (this.game.physics.arcade.distanceBetween(this, this.target) < this.minAttackDistance) {
            var delta = targetAngle - this.rotation;
            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;
            if (delta > 0) {
                // Turn counterclockwise
                this.angle -= this.turnRate;
            } else {
                // Turn clockwise
                this.angle += this.turnRate;
            }
        } else {
            this.isSlowing = false;
            this.isAttacking = true;
        }

    } else { // TWEEN - not attacking, spinning and pulling back instead
        this.avoidObstacle();
    }

    if (this.wasHit) {
        this.avoidObstacle();
        this.wasHit = false;
    }
};


Ufo.prototype.catchTarget = function (bullet) {
    bullet.x = this.target.x;
    bullet.y = this.target.y;
    this.target.body.velocity.x = 0;
    this.target.body.velocity.y = 0;
    this.target.thrust = 0;
    bullet.caughtTarget = true;
    this.fartSound.play('', 0, 1.0, false, true);
};

Ufo.prototype.fireDeathRay = function () {
    if (this.deathRayCharge >= this.DEATHRAY_DISCHARGE) {
        this.deathRayCharge -= this.DEATHRAY_DISCHARGE;
        var deathRay = this.deathrays.getFirstDead();
        if (!deathRay) {
            deathRay = new DeathRay(this.game, this.DEATHRAY_SCALE, this.x, this.y, this.angle);
            this.deathrays.add(deathRay);
        }
        this.deathRaySound.play('', 0, 0.4, false, true);
        deathRay.reset(this.x, this.y);
        deathRay.revive();
    }
};

Ufo.prototype.updateWeapons = function () {
    // Tar bullet
    this.tar = 1;
    if (this.hasBullets && this.alive) {
        this.bullets.forEach(function (bullet) {
            if (bullet) {
                if (bullet.caughtTarget) this.tar++;
                if (this.game.physics.arcade.distanceBetween(bullet, this.target) > this.BULLETLOCKDISTANCE) {
                    this.game.physics.arcade.accelerateToObject(bullet, this.target, this.BULLETACCELERATION, this.MAXBULLETSPEED, this.MAXBULLETSPEED);
                } else {
                    this.game.physics.arcade.moveToObject(bullet, this.target, parseInt(this.target.body.speed) * 10);
                }
                if (bullet.lifespan < this.game.time.now) {
                    bullet.kill();
                }
            }
        }, this, true);
    }
};

