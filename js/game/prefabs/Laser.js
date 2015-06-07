/**
 * Created by joelsaxton on 11/9/14.
 */

var Laser = function(game, laserScale, x, y, angle, key, frame){
    key = 'laser';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.scale.setTo(laserScale);
    this.anchor.setTo(0.5,0.5);
    this.game.physics.arcade.enableBody(this);
    this.events.onRevived.add(this.onRevived, this);
    this.body.allowGravity = false;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;
    this.laserLifeSpan = 1000;
    this.angle = angle;
    this.speed = 1200;
    this.damage = 10;
    this.charge = 50;
};

Laser.prototype = Object.create(Phaser.Sprite.prototype);
Laser.prototype.constructor = Laser;

Laser.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.laserLifeSpan;
    this.body.velocity.x = Math.cos(this.rotation) * this.speed;
    this.body.velocity.y = Math.sin(this.rotation) * this.speed;
};
