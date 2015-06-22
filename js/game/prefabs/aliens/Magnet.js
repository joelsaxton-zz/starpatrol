/**
 * Created by joelsaxton on 11/10/14.
 */

var Magnet = function(main, player, scale, x, y, key, frame){
    key = 'magnet';
    Phaser.Sprite.call(this, main.game, x, y, key, frame);

    this.main = main;
    this.type = key;
    this.alienScale = scale;
    this.id = this.game.rnd.uuid();
    this.anchor.setTo(0.5);
    this.scale.setTo(scale * 2);
    this.MAXHEALTH = 150;
    this.health = this.MAXHEALTH;
    this.MAXCHARGE = 100;
    this.WEAPON_DAMAGE = 25;
    this.KILL_SCORE = 2000;
    this.MAXTHRUST = this.alienScale * 50;
    this.MAXVELOCITY = this.alienScale * 4000;
    this.BULLETSCALE = this.alienScale * 0.4;
    this.BULLETLOCKDISTANCE = this.alienScale * 2000;
    this.BULLETACCELERATION = this.alienScale * 4000;
    this.MAXBULLETSPEED = this.alienScale * 6000;
    this.MAXBULLETDISTANCE = this.alienScale * 6000;
    this.MAXTRACTORBEAMDISTANCE = this.alienScale * 4000;
    this.TRACTORBEAMFORCE = this.alienScale * 8000;
    this.BULLET_DISCHARGE = 100;
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
    this.MAGNET_DAMAGE = 1;
    this.hasTractorBeam = true;

    // Sounds
    this.tractorBeamSound = this.game.add.audio('tractor-beam');
    this.bulletSound = this.game.add.audio('bullet');

    // Animations
    this.animations.add('cruise', [0]);
    this.animations.add('attract', [1,2,3,2,3,2]);

};

Magnet.prototype = Object.create(Phaser.Sprite.prototype);
Magnet.prototype.constructor = Magnet;
Magnet.prototype.avoidObstacle = Alien.prototype.avoidObstacle;
Magnet.prototype.die = Alien.prototype.die;
Magnet.prototype.createBullet = Alien.prototype.createBullet;
Magnet.prototype.onRevived = Alien.prototype.onRevived;

Magnet.prototype.update = function() {
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.target.x, this.target.y
    );

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

        // Use tractor beam
        if (!this.isTractorBeamOn && this.tractorBeam == 100 && this.game.physics.arcade.distanceBetween(this, this.target) < this.MAXTRACTORBEAMDISTANCE) {
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

            // Magnet observes minimum distance after using tractor beam
            if (this.game.physics.arcade.distanceBetween(this, this.target) < this.minAttackDistance) {
                this.isSlowing = true;
                this.isAttacking = false;
                this.avoidObstacle();
            }
        }

        // Fire heat seeking bullet
        if (this.charge >= this.BULLET_DISCHARGE) { // @todo change the countliving stuff
            if (this.bullets.countLiving() < 2 && this.game.physics.arcade.distanceBetween(this, this.target) < this.MAXBULLETDISTANCE) {
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

    if (this.wasHit) {
        this.avoidObstacle();
        this.wasHit = false;
    }
};

Magnet.prototype.updateWeapons = function()
{
    if (this.alive) {
        // Heat seeking bullet
        this.bullets.forEach(function (bullet) {
            if (bullet) {
                if (this.game.physics.arcade.distanceBetween(bullet, this.target) > this.BULLETLOCKDISTANCE) {
                    this.game.physics.arcade.accelerateToObject(bullet, this.target, this.BULLETACCELERATION, this.MAXBULLETSPEED, this.MAXBULLETSPEED);
                } else {
                    this.game.physics.arcade.moveToObject(bullet, this.target, parseInt(this.target.body.speed) * 10);
                }
                if (bullet.lifespan < this.game.time.now) {
                    this.main.detonate(bullet, 100, false, 'destroy');
                }
            }
        }, this);
    }
};
