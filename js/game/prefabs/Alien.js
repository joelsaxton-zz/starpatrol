/**
 * Created by joelsaxton on 11/10/14.
 */

var Alien = function(game, player, scale, x, y, key, frame){
    key = 'alien';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5);
    this.scale.setTo(scale * 2);
    this.MAXHEALTH = 100;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.BULLET_DAMAGE = 0;
    this.MAXTHRUST = this.alienScale * 50;
    this.MAXVELOCITY = this.alienScale * 3800;
    this.BULLETSCALE = this.alienScale * 0.4;
    this.BULLETLOCKDISTANCE = this.alienScale * 2000;
    this.BULLETACCELERATION = this.alienScale * 4000;
    this.MAXBULLETSPEED = this.alienScale * 6000;
    this.MAXBULLETDISTANCE = this.alienScale * 6000;
    this.MAXTRACTORBEAMDISTANCE = this.alienScale * 3000;
    this.TRACTORBEAMFORCE = this.alienScale * 6000;
    this.BULLET_DISCHARGE = 65;
    this.charge = this.MAXCHARGE;
    this.tractorBeam = this.MAXCHARGE;
    this.isTractorBeamOn = false;
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
    this.bullets = this.game.add.group();

    // Sounds
    this.tractorBeamSound = this.game.add.audio('tractor-beam');
    this.bulletSound = this.game.add.audio('bullet');

};

Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;

Alien.prototype.onRevived = function() {
    this.charge = this.MAXCHARGE;
    this.health = this.MAXHEALTH;
    this.alive = true;
    this.isAttacking = true;
    this.isSlowing = false;
};

Alien.prototype.avoidObstacle = function() {
    this.isAttacking = false;
    this.isTractorBeamOn = false;
    this.tractorBeamSound.stop();
    this.body.allowGravity = false;
    var angle = this.game.rnd.realInRange(-180, 180);
    this.game.add.tween(this).to({angle: this.angle + angle}, 500, Phaser.Easing.Linear.None)
        .start()
        .onComplete.add(function(){
            this.body.allowGravity = true;
            this.isAttacking = true;
        }, this);
};

Alien.prototype.createBullet = function(x, y) {
    var bullet = this.bullets.getFirstDead();
    if (!bullet) {
        bullet = new Bullet(this.game, this.BULLETSCALE, x, y);
        this.bullets.add(bullet);
    }
    bullet.reset(this.x, this.y);
    bullet.revive();
};

Alien.prototype.update = function() {
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

    // ATTACK
    if (this.isAttacking) {
        // Alien speeds up
        if (this.speed < this.MAXVELOCITY) {
            this.speed += this.MAXTHRUST;
        }

        // Alien observes minimum distance
        if (this.game.physics.arcade.distanceBetween(this, this.target) < this.minAttackDistance) {
            this.isSlowing = true;
            this.isAttacking = false;
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

        // Use tractor beam
        if (!this.isTractorBeamOn && this.tractorBeam >= 90 && this.game.physics.arcade.distanceBetween(this, this.target) < this.MAXTRACTORBEAMDISTANCE) {
            this.isTractorBeamOn = true;
            this.animations.play('attract', 20, true);
            this.tractorBeamSound.play('', 0, 0.1, true, true);
        }
        if (this.isTractorBeamOn) {
            this.tractorBeam -= 1;
            this.target.body.allowGravity = true;
            this.target.body.gravity = new Phaser.Point(this.x - this.target.x, this.y - this.target.y);
            this.target.body.gravity = this.target.body.gravity.normalize().multiply(this.TRACTORBEAMFORCE, this.TRACTORBEAMFORCE);
        }
        if (this.tractorBeam < 10 || this.game.physics.arcade.distanceBetween(this, this.target) > this.MAXTRACTORBEAMDISTANCE) {
            this.isTractorBeamOn = false;
            this.animations.play('cruise', 20);
            this.tractorBeamSound.stop();
        }

        // Fire heat seeking bullet
        if (this.charge >= this.BULLET_DISCHARGE) { // @todo change the countliving stuff
            if (this.bullets.countLiving() < 3 && this.game.physics.arcade.distanceBetween(this, this.target) < this.MAXBULLETDISTANCE) {
                this.bulletSound.play('', 0, 1, false, true);
                this.createBullet(this.x, this.y);
                this.charge -= this.BULLET_DISCHARGE;
            }
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
};