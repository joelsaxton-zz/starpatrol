/**
 * Created by joelsaxton on 11/10/14.
 */

var Flameship = function (main, player, scale, x, y, key, frame) {
    key = 'flameship';

    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0, 0.5);
    this.scale.setTo(scale * 2);
    this.MAXHEALTH = 200;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.isAttacking = true;
    this.WEAPON_DAMAGE = 10;
    this.KILL_SCORE = 10000;
    this.MAXTHRUST = this.alienScale * 10;
    this.MAXVELOCITY = this.alienScale * 4000;
    this.ATTACKVELOCITY = this.alienScale * 8000;
    this.maxVelocity = this.MAXVELOCITY;
    this.flameTimer = 0;
    this.flameInterval = 1000;
    this.retreatTimer = 0;
    this.retreatInterval = 3000;
    this.charge = this.MAXCHARGE;
    this.player = player;
    this.target = this.player;
    this.flameTarget = {x: 0, y: 0};
    this.retreatTarget = {x:0, y: 0};
    this.distance = 0;
    this.targetAngle = 0;
    this.x_offset = 10;
    this.y_offset = 10;
    this.hasNewFlameTarget = false;
    this.alive = true;
    this.game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0.8);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1.5;
    this.speed = 0;
    this.attackDistance = 300;
    this.minAttackDistance = 80;
    this.retreatDistance = 2000;
    this.targetSwitchDistance = 40; // How close to get to target before switching to new target
    this.hasTractorBeam = false;
    this.hasDrill = false;
    this.hasBullets = false;
    this.hasFlameTrail = true;
    this.flameLifespan = 5000;

    // Sounds
    this.flameSound = this.game.add.audio('flame');
    this.burningSound = this.game.add.audio('burning');

    // Exhaust emitter
    this.smokeEmitter = this.main.add.emitter(0, 0, 400);
    this.smokeEmitter.lifespan = this.flameLifespan;
    // Set motion parameters for the emitted particles
    this.smokeEmitter.gravity = 0;
    this.smokeEmitter.setXSpeed(-2, 2);
    this.smokeEmitter.setYSpeed(-2, 2);

    this.smokeEmitter.setAlpha(0.8, 0.1, this.smokeEmitter.lifespan,
        Phaser.Easing.Linear.InOut);

    // Create the actual particles
    this.smokeEmitter.makeParticles('flametrail', [3, 4, 5, 6, 7, 8, 9, 10], 400, false);

    // Start emitting smoke particles one at a time (explode=false) with a
    // lifespan of 25ms intervals
    this.smokeEmitter.start(false, this.smokeEmitter.lifespan, 10);
    this.smokeEmitter.on = false;

};

Flameship.prototype = Object.create(Phaser.Sprite.prototype);
Flameship.prototype.constructor = Flameship;
Flameship.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Flameship.prototype.die = Alien.prototype.die;
Flameship.prototype.onRevived = Alien.prototype.onRevived;
Flameship.prototype.updateWeapons = Alien.prototype.updateWeapons;

Flameship.prototype.update = function () {

    this.smokeEmitter.x = this.x;
    this.smokeEmitter.y = this.y;

    this.targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // DISTANCE
    this.distanceToPlayer = this.game.physics.arcade.distanceBetween(this, this.player);
    this.distanceToFlameTarget = this.game.physics.arcade.distanceBetween(this, this.flameTarget);
    this.distanceToRetreatTarget = this.game.physics.arcade.distanceBetween(this, this.retreatTarget);

    // Flameship speeds up
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

    if (this.distanceToPlayer <= this.minAttackDistance) { // Retreat to make another pass
        if (this.isAttacking) {
            this.retreatTimer = this.game.time.now + this.retreatInterval;
            this.isAttacking = false;
            this.maxVelocity = this.MAXVELOCITY;
            this.getRetreatTarget();
        }
        this.target = this.retreatTarget;

    } else if (this.isAttacking && (this.distanceToPlayer <= this.attackDistance || this.hasNewFlameTarget)) { // Spray flames in front of target
        if (!this.hasNewFlameTarget) {
            this.flameTimer = this.game.time.now + this.flameInterval;
            this.hasNewFlameTarget = true;
            this.maxVelocity = this.ATTACKVELOCITY;
            this.getFlameTarget();
            this.smokeEmitter.on = true;
            this.flameSound.play('', 0, 1.0, false, false);
            this.burningSound.play('', 0, 0.1, false, false);
        }
        this.target = this.flameTarget;

        // Switch back to player once flame target is reached
        if (this.flameTimer < this.game.time.now || this.distanceToFlameTarget <= this.targetSwitchDistance) {
            this.maxVelocity = this.MAXVELOCITY;
            this.hasNewFlameTarget = false;
            this.smokeEmitter.on = false;
            this.target = this.player;
        }

    } else { // If farther than both cases, check if retreating or if should attack again

        // Switch back to player once retreat target is reached
        if (!this.isAttacking && ( this.retreatTimer < this.game.time.now || this.distanceToRetreatTarget <= this.targetSwitchDistance)) {
            this.hasNewFlameTarget = false;
            this.isAttacking = true;
            this.smokeEmitter.on = false;
            this.target = this.player;
        }
    }
};

Flameship.prototype.getRetreatTarget = function () {
    var x = this.player.x;
    var y = this.player.y;
    var x_vel = this.player.body.velocity.x;
    var y_vel = this.player.body.velocity.y;
    this.x_offset = x_vel <=0 ? this.retreatDistance : -this.retreatDistance;
    this.y_offset = y_vel <=0 ? this.retreatDistance : -this.retreatDistance;

    this.retreatTarget.x = x + this.x_offset;
    this.retreatTarget.y = y + this.y_offset;

    // Handle out of bounds cases
    if (this.retreatTarget.x < 0) this.retreatTarget.x = 0;
    if (this.retreatTarget.y < 0) this.retreatTarget.y = 0;
    if (this.retreatTarget.x > this.GAMESIZE) this.retreatTarget.x = this.GAMESIZE;
    if (this.retreatTarget.y > this.GAMESIZE) this.retreatTarget.y = this.GAMESIZE;
};

Flameship.prototype.getFlameTarget = function () {
    var x = this.player.x;
    var y = this.player.y;
    var x_vel = this.player.body.velocity.x;
    var y_vel = this.player.body.velocity.y;
    this.x_offset = this.game.rnd.integerInRange(1, 3);
    this.y_offset = this.game.rnd.integerInRange(1, 3);
    this.flameTarget.x = x + x_vel * this.x_offset;
    this.flameTarget.y = y + y_vel * this.y_offset;

    // Handle out of bounds cases
    if (this.flameTarget.x < 0) this.flameTarget.x = 0;
    if (this.flameTarget.y < 0) this.flameTarget.y = 0;
    if (this.flameTarget.x > this.GAMESIZE) this.flameTarget.x = this.GAMESIZE;
    if (this.flameTarget.y > this.GAMESIZE) this.flameTarget.y = this.GAMESIZE;
};

Flameship.prototype.die = function () {
    this.alive = false;
    this.flameSound.stop();
    this.burningSound.stop();
    this.smokeEmitter.on = false;
};

