/**
 * Created by joelsaxton on 11/10/14.
 */

var Sputnik = function(main, player, scale, x, y, key, frame){
    key = 'sputnik';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5);
    this.scale.setTo(scale * 2);
    this.MAXHEALTH = 50;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.WEAPON_DAMAGE = 50;
    this.COLLISION_DAMAGE = 5;
    this.MAXTHRUST = this.alienScale * 10;
    this.MAXVELOCITY = this.alienScale * 2000;
    this.ANGRY_VELOCITY = this.MAXVELOCITY * 2;
    this.SUICIDE_VELOCITY = this.MAXVELOCITY * 4;
    this.SUICIDE_THRUST = this.alienScale * 20;
    this.KILL_SCORE = 1000;
    this.charge = this.MAXCHARGE;
    this.tractorBeam = this.MAXCHARGE;
    this.isTractorBeamOn = false;
    this.target = player;
    this.alive = true;
    this.game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1;
    this.speed = 0;
    this.minAttackDistance = 100;
    this.isAttacking = true;
    this.isSlowing = false;
    this.ANGRY_HEALTH = 30;
    this.SUICIDE_HEALTH = 10;
    this.MAX_SUICIDE_DISTANCE = 200;
    this.MIN_SUICIDE_DISTANCE = 80;
    this.tractorBeam = 0;
    this.bullets = [];
    this.wasHit = false;
    this.hasTractorBeam = false;
    this.hasDrill = false;
    this.hasBullets = false;

    // Sounds
    this.suicideSound = this.game.add.audio('suicide');

    // Set alien animations
    this.animations.add('cruise', [0,1]);
    this.animations.add('suicide', [2,3]);

};

Sputnik.prototype = Object.create(Phaser.Sprite.prototype);
Sputnik.prototype.updateWeapons = Alien.prototype.updateWeapons;
Sputnik.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Sputnik.prototype.constructor = Sputnik;

Sputnik.prototype.onRevived = function() {
    this.animations.play('cruise', 20, true);
    this.charge = this.MAXCHARGE;
    this.health = this.MAXHEALTH;
    this.alive = true;
};

Sputnik.prototype.update = function() {
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // ATTACK
    if (this.isAttacking) {
        // Sputnik speeds up
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

        if (this.health > this.SUICIDE_HEALTH && this.game.physics.arcade.distanceBetween(this, this.target) < this.minAttackDistance) {
            this.isSlowing = true;
        }

        if (this.health <= this.ANGRY_HEALTH) {
            this.MAXVELOCITY = this.ANGRY_VELOCITY;
            this.suicideSound.play('', 0, 0.2, false, false);
            this.isAttacking = true;
        }

        if (this.health <= this.SUICIDE_HEALTH) {
            this.MAXVELOCITY = this.SUICIDE_VELOCITY;
            this.MAXTHRUST = this.SUICIDE_THRUST;
            this.isAttacking = true;
            this.animations.play('suicide', 20, true);
            this.suicideSound.play('', 0, 0.1, false, true);
            if (this.game.physics.arcade.distanceBetween(this, this.target) < this.MIN_SUICIDE_DISTANCE) {
                this.commitSuicide();
            }
        }

      // SLOW DOWN
    } else if (this.isSlowing) {
        this.animations.play('cruise', 20, true);
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

Sputnik.prototype.commitSuicide = function()
{
    if (this.alive == true) {
        var distance = this.game.physics.arcade.distanceBetween(this, this.target);
        var modifier = Math.abs(this.MAX_SUICIDE_DISTANCE - distance) / this.MAX_SUICIDE_DISTANCE;
        this.target.health -= this.WEAPON_DAMAGE * modifier;
        this.main.killAlien();
    }
};

Sputnik.prototype.die = function()
{
    this.alive = false;
    this.suicideSound.stop();
};