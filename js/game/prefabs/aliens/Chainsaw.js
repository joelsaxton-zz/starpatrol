/**
 * Created by joelsaxton on 11/10/14.
 */

var Chainsaw = function (main, player, scale, x, y, key, frame) {
    key = 'chainsaw';

    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(scale * 2);
    this.MAXHEALTH = 100;
    this.FIRST_ATTACK_HEALTH = 90;
    this.SECOND_ATTACK_HEALTH = 60;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.CHAINSAW_DISCHARGE = 0.1;
    this.isAttacking = true;
    this.WEAPON_DAMAGE = 1;
    this.KILL_SCORE = 2000;
    this.MAXTHRUST = this.alienScale * 4;
    this.MAXVELOCITY = this.alienScale * 2000;
    this.ATTACKVELOCITY = this.alienScale * 4000;
    this.maxVelocity = this.MAXVELOCITY;
    this.retreatTimer = 0;
    this.retreatInterval = 8000;
    this.charge = this.MAXCHARGE;
    this.player = player;
    this.target = this.player;
    this.retreatTarget = {x: 0, y: 0};
    this.distance = 0;
    this.targetAngle = 0;
    this.x_offset = 10;
    this.y_offset = 10;
    this.alive = true;
    this.game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0.8);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1.2;
    this.speed = 0;
    this.attackDistance = 300;
    this.minAttackDistance = 100;
    this.retreatDistance = 4000;
    this.targetSwitchDistance = 40; // How close to get to target before switching to new target
    this.hasTractorBeam = false;
    this.hasDrill = false;
    this.hasBullets = false;
    this.hasFlameTrail = false;
    this.flameLifespan = 400;
    this.firstAttack = false;
    this.secondAttack = false;

    // Chainsaw exhaust emitter
    this.smokeEmitter = this.main.add.emitter(0, 0, 100);
    this.smokeEmitter.lifespan = this.flameLifespan;

    // Set motion parameters for the emitted particles
    this.smokeEmitter.gravity = 0;
    this.smokeEmitter.setXSpeed(0, 0);
    this.smokeEmitter.setYSpeed(-200, -300);

    this.smokeEmitter.setAlpha(1, 0.1, this.smokeEmitter.lifespan,
        Phaser.Easing.Linear.InOut);

    // Create the actual particles
    this.smokeEmitter.makeParticles('smoketrail', [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 100, false);

    // Start emitting smoke particles one at a time (explode=false) with a
    // lifespan of 25ms intervals
    this.smokeEmitter.start(false, this.smokeEmitter.lifespan, 20);
    this.smokeEmitter.on = false;

    // Animations
    this.animations.add('cruise', [0]);
    this.animations.add('chainsaw', [0, 1]);
    this.animations.play('cruise', 20);

    // Sounds
    this.chainsawOn = this.game.add.audio('chainsaw');
    this.chainsawIdle = this.game.add.audio('chainsaw-idle');
    this.chainsawAttack = this.game.add.audio('chainsaw-attack');

};

Chainsaw.prototype = Object.create(Phaser.Sprite.prototype);
Chainsaw.prototype.constructor = Chainsaw;
Chainsaw.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Chainsaw.prototype.die = Alien.prototype.die;
Chainsaw.prototype.onRevived = Alien.prototype.onRevived;

Chainsaw.prototype.updateWeapons = function() {
    // Attack with drill if close enough
    if (this.alive) {
        var distance = this.game.physics.arcade.distanceBetween(this, this.target);
        if (distance <= this.minAttackDistance && this.charge > 0) {
            this.chainsawAttack.play('', 0, 0.5, false, false);
            this.charge -= this.CHAINSAW_DISCHARGE;
            this.target.health -= this.WEAPON_DAMAGE;
            var explosionAnimation = this.main.smallExplosions.getFirstExists(false);
            explosionAnimation.reset(this.target.x, this.target.y);
            explosionAnimation.play('explosion', 500, false, true);
        }
    }
}

Chainsaw.prototype.update = function () {

    this.smokeEmitter.x = this.x;
    this.smokeEmitter.y = this.y;

    this.targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // DISTANCE
    this.distanceToPlayer = this.game.physics.arcade.distanceBetween(this, this.player);
    this.distanceToRetreatTarget = this.game.physics.arcade.distanceBetween(this, this.retreatTarget);

    // Chainsaw speeds up
    if (this.speed < this.maxVelocity) {
        this.speed += this.MAXTHRUST;
    }

    if (this.rotation !== this.targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = this.targetAngle - this.rotation;

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
            this.rotation = this.targetAngle;
        }
    }

    this.body.velocity.x = Math.cos(this.rotation) * this.speed;
    this.body.velocity.y = Math.sin(this.rotation) * this.speed;

    if (this.charge <= 10 && this.distanceToPlayer <= this.minAttackDistance) {
        if (this.isAttacking) {
            this.secondAttack = true;
            this.retreatTimer = this.game.time.now + this.retreatInterval;
            this.isAttacking = false;
            this.maxVelocity = this.MAXVELOCITY;
            this.getRetreatTarget();
            this.smokeEmitter.on = false;
        }
        this.target = this.retreatTarget;

    } else if (this.charge > 0 && this.isAttacking && this.distanceToPlayer <= this.attackDistance) {
        this.maxVelocity = this.ATTACKVELOCITY;
        this.smokeEmitter.on = true;
        this.charge -= this.CHAINSAW_DISCHARGE;

        if (!this.firstAttack && this.health < this.FIRST_ATTACK_HEALTH) {
            this.chainsawOn.play('', 0, 1.0, false, false);
            this.firstAttack = true;
        }

        if (!this.secondAttack && this.health < this.SECOND_ATTACK_HEALTH) {
            this.chainsawAttack.play('', 0, 1.0, false, false);
            this.secondAttack = true;
        }

        this.target = this.player;
        this.chainsawIdle.play('', 0, 0.25, true, false);

    } else { // If farther than both cases, check if retreating or if should attack again

        // Switch back to player once retreat target is reached
        if (!this.isAttacking && ( this.retreatTimer < this.game.time.now || this.distanceToRetreatTarget <= this.targetSwitchDistance)) {
            this.isAttacking = true;
            this.smokeEmitter.on = false;
            this.target = this.player;
        }
    }
};

Chainsaw.prototype.getRetreatTarget = function () {
    var x = this.player.x;
    var y = this.player.y;
    var x_vel = this.player.body.velocity.x;
    var y_vel = this.player.body.velocity.y;
    this.x_offset = x_vel <= 0 ? this.retreatDistance : -this.retreatDistance;
    this.y_offset = y_vel <= 0 ? this.retreatDistance : -this.retreatDistance;

    this.retreatTarget.x = x + this.x_offset;
    this.retreatTarget.y = y + this.y_offset;

    // Handle out of bounds cases
    if (this.retreatTarget.x < 0) this.retreatTarget.x = 0;
    if (this.retreatTarget.y < 0) this.retreatTarget.y = 0;
    if (this.retreatTarget.x > this.GAMESIZE) this.retreatTarget.x = this.GAMESIZE;
    if (this.retreatTarget.y > this.GAMESIZE) this.retreatTarget.y = this.GAMESIZE;
};

Chainsaw.prototype.die = function () {
    this.alive = false;
    this.smokeEmitter.on = false;
    this.chainsawOn.stop();
    this.chainsawIdle.stop();
    this.chainsawAttack.stop();
};

