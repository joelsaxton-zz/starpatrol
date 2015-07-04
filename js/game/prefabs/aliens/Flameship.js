/**
 * Created by joelsaxton on 11/10/14.
 */

var Flameship = function(main, player, scale, x, y, key, frame){
    key = 'flameship';

    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(1, 0.5);
    this.scale.setTo(scale * 2.5);
    this.MAXHEALTH = 200;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.INVISIBILITY_DISCHARGE = 0.5;
    this.INVISIBILITY_DISTANCE = 1000;
    this.FLAMETHROWER_DISTANCE = 100;
    this.MAX_FLAMEFUEL = 100;
    this.flameFuel = this.MAX_FLAMEFUEL;
    this.flameFuelInterval = 40;
    this.flameFuelTimer = 0;
    this.FLAMETHROWER_DISCHARGE = 60;
    this.isFiring = false;
    this.WEAPON_DAMAGE = 5;
    this.KILL_SCORE = 8000;
    this.MAXTHRUST = this.alienScale * 20;
    this.MAXVELOCITY = this.alienScale * 4400;
    this.charge = this.MAXCHARGE;
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
    this.hasBullets = false;
    this.disappearTimer = 0;
    this.disappearInterval = 700;
    this.isInvisible = false;

    // Animations
    this.animations.add('cruise', [0]);
    this.animations.add('disappear', [1,2,1,2,3,2,3]);
    this.animations.add('invisible', [4]);
    this.animations.play('cruise', 100, true);

    // Flamethrower
    this.flame = this.game.add.sprite(0, 0, 'flame');
    this.flame.scale.setTo(2);
    this.flame.animations.add('fire', [0,1,2,3,4,6]);
    this.flame.animations.play('fire', 50, true);
    this.flame.anchor.setTo(0, 0.48);
    this.addChild(this.flame);
    this.game.physics.arcade.enableBody(this.flame);
    this.flame.kill();

    // Sounds
    this.flameSound = this.game.add.audio('flame');
    this.invisibleSound = this.game.add.audio('invisible');
    this.burningSound = this.game.add.audio('burning');

};

Flameship.prototype = Object.create(Phaser.Sprite.prototype);
Flameship.prototype.constructor = Flameship;
Flameship.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Flameship.prototype.die = Alien.prototype.die;
Flameship.prototype.onRevived = Alien.prototype.onRevived;
Flameship.prototype.updateWeapons = Alien.prototype.updateWeapons;

Flameship.prototype.update = function() {
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
        if (!this.isDisappearing && !this.isFiring && this.charge > 95 && distance <= this.INVISIBILITY_DISTANCE) {
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

        // Flamethrower refuel timer
        if (this.flameFuelTimer < this.game.time.now) {
            this.flameFuelTimer = this.game.time.now + this.flameFuelInterval;
            if (this.flameFuel < this.MAX_FLAMEFUEL) {
                this.flameFuel++;
            }
        }

        // Use flamethrower
        if (distance <= this.FLAMETHROWER_DISTANCE && !this.isFiring && this.flameFuel >= 95) {
            this.isFiring = true;
            this.isInvisible = false;
            this.animations.play('cruise', 100, true);
            this.flame.revive();
            this.flame.bringToTop();
            this.flameFuel -= this.FLAMETHROWER_DISCHARGE;
            this.flameSound.play('', 0, 0.8, false, false);
        }

        // Check flamethrower damage
        if (this.isFiring && !this.target.isShielded && this.game.physics.arcade.overlap(this.target, this.flame)) {
            this.target.health -= this.WEAPON_DAMAGE;
            this.burningSound.play('', 0, 1.0, false, false);
        }

        // Turn off flamethrower
        if (this.isFiring && distance >= this.FLAMETHROWER_DISTANCE || this.flameFuel <= 5) {
            this.flame.kill();
            this.isFiring = false;
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

Flameship.prototype.die = function()
{
    this.alive = false;
    this.flameSound.stop();
    this.invisibleSound.stop();
    this.burningSound.stop();
};

