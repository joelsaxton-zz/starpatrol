/**
 * Created by joelsaxton on 11/10/14.
 */

var Drill = function(main, player, scale, x, y, key, frame){
    key = 'drill';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5);
    this.scale.setTo(scale * 1.8);
    this.MAXHEALTH = 100;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.DRILL_DAMAGE = 1;
    this.MAXTHRUST = this.alienScale * 40;
    this.MAXVELOCITY = this.alienScale * 2800;
    this.ANGRY_VELOCITY = this.MAXVELOCITY * 2;
    this.KILL_SCORE = 1000;
    this.DRILL_DISTANCE = 50;
    this.charge = this.MAXCHARGE;
    this.tractorBeam = this.MAXCHARGE;
    this.isTractorBeamOn = false;
    this.target = player;
    this.alive = true;
    this.game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1;
    this.speed = 0;
    this.minAttackDistance = 100;
    this.isAttacking = true;
    this.isSlowing = false;
    this.ANGRY_HEALTH = 30;
    this.tractorBeam = 0;
    this.bullets = [];
    this.wasHit = false;
    this.hasTractorBeam = false;

    // Sounds
    this.drillSound = this.game.add.audio('drill');
};

Drill.prototype = Object.create(Phaser.Sprite.prototype);
Drill.prototype.constructor = Drill;

Drill.prototype.onRevived = function() {
    this.animations.play('cruise', 20, true);
    this.charge = this.MAXCHARGE;
    this.health = this.MAXHEALTH;
    this.alive = true;

};

Drill.prototype.avoidObstacle = Alien.prototype.avoidObstacle;

Drill.prototype.update = function() {
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // ATTACK
    if (this.isAttacking) {
        // Drill speeds up
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

        if (this.health > this.ANGRY_HEALTH && this.game.physics.arcade.distanceBetween(this, this.target) < this.minAttackDistance) {
            this.isSlowing = true;
        }

        if (this.health <= this.ANGRY_HEALTH) {
            this.MAXVELOCITY = this.ANGRY_VELOCITY;
            this.isAttacking = true;
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

Drill.prototype.updateWeapons = function () {
    // Attack with drill if close enough
    if (this.alive) {
        var distance = this.game.physics.arcade.distanceBetween(this, this.target);
        if (distance <= this.DRILL_DISTANCE && this.charge > 0) {
            this.drillSound.play('', 0, 0.5, false, false);
            this.charge--;
            this.target.health -= this.DRILL_DAMAGE;
            var explosionAnimation = this.main.smallExplosions.getFirstExists(false);
            explosionAnimation.reset(this.target.x, this.target.y);
            explosionAnimation.play('explosion', 500, false, true);
        }
    }
};


Drill.prototype.die = function()
{
    this.alive = false;
    this.drillSound.stop();
};