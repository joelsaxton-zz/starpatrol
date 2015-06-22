/**
 * Created by joelsaxton on 11/10/14.
 */

var Alien = function(){
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
        this.game.add.tween(this).to({angle: this.angle + angle}, 500, Phaser.Easing.Linear.None)
            .start()
            .onComplete.add(function () {
                if (this.alive && this.body) {
                    this.body.allowGravity = true;
                    this.isAttacking = true;
                }
            }, this);
    }
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


Alien.prototype.die = function () {
    this.isTractorBeamOn = false;
    this.tractorBeamSound.stop();
    if (this.bullets) {
        this.bullets.forEach(function (bullet) {
            this.main.detonate(bullet, 100, false, 'destroy');
        }, this);
    }
    this.alive = false;
};