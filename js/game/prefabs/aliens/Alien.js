/**
 * Created by joelsaxton on 11/10/14.
 */

var Alien = function(){
    this.hasBullets = false;
    this.hasDrill = false;
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
    if (this.hasTractorBeam) {
        this.isTractorBeamOn = false;
        this.tractorBeamSound.stop();
    }

    if (this.alive && this.body) {
        this.body.allowGravity = false;
        var angle = this.game.rnd.realInRange(-180, 180);
        this.game.add.tween(this).to({angle: this.angle + angle}, 1000, Phaser.Easing.Linear.None)
            .start()
            .onComplete.add(function () {
                if (this.alive && this.body) {
                    this.body.allowGravity = true;
                    this.isAttacking = true;
                }
            }, this);
    }
};

Alien.prototype.createBullet = function (x, y) {

    var bullet = new Bullet(this.game, this.key, x, y);
    this.bullets.add(bullet);

    bullet.reset(this.x, this.y);
    bullet.revive();
};


Alien.prototype.die = function () {
    if (this.hasTractorBeam) {
        this.isTractorBeamOn = false;
        this.tractorBeamSound.stop();
    }

    if (this.hasDrill) {
        this.drillSound.stop();
    }

    if (this.bullets) {
        this.bullets.forEach(function (bullet) {
            this.main.detonate(bullet, 100, false, 'destroy');
        }, this);
    }
    this.alive = false;
};

Alien.prototype.updateWeapons = function() {

    // Heat seeking bullet
    if (this.hasBullets && this.alive) {
        this.bullets.forEach(function (bullet) {
            if (bullet) {
                if (this.game.physics.arcade.distanceBetween(bullet, this.target) > this.BULLETLOCKDISTANCE) {
                    this.game.physics.arcade.accelerateToObject(bullet, this.target, this.BULLETACCELERATION, this.MAXBULLETSPEED, this.MAXBULLETSPEED);
                } else {
                    this.game.physics.arcade.moveToObject(bullet, this.target, parseInt(this.target.body.speed) * 10);
                }
                if (bullet.lifespan < this.game.time.now) {
                    if (bullet.key = 'ufo-bullet') {
                        bullet.kill();

                    } else {
                        this.main.detonate(bullet, 100, false, 'destroy');
                    }
                }
            }
        }, this);
    }

    // Attack with drill if close enough
    if (this.hasDrill && this.alive) {
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
