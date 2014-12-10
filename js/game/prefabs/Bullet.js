/**
 * Created by joelsaxton on 11/9/14.
 */

var Bullet = function(game, bulletScale, x, y, key, frame){
    key = 'bullet';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.scale.setTo(bulletScale);
    this.anchor.setTo(0.5);
    this.game.physics.arcade.enableBody(this);
    this.animations.add('bullet');
    this.body.allowGravity = false;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;
    this.events.onRevived.add(this.onRevived, this);
    this.bulletLifeSpan = 12000;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.bulletLifeSpan;
    this.animations.play('bullet', 20, true);
};
