/**
 * Created by joelsaxton on 11/9/14.
 */

var Bullet = function(game, ship, x, y, key, frame){

    var key, bulletScale;

    if (ship == 'magnet') {
        key = 'bullet';
        bulletScale = 0.1;
        Phaser.Sprite.call(this, game, x, y, key, frame);
        this.animations.add('bullet', [0,1,2,3,2,1]);
        this.bulletLifeSpan = 8000;
    }
    if (ship == 'drill') {
        key = 'drill-bullet';
        bulletScale = 0.15;
        Phaser.Sprite.call(this, game, x, y, key, frame);
        this.animations.add('bullet');
        this.bulletLifeSpan = 8000;
    }

    if (ship == 'ufo') {
        key = 'ufo-bullet';
        bulletScale = 0.6;
        Phaser.Sprite.call(this, game, x, y, key, frame);
        this.animations.add('bullet', [0,1,2,3,2,1]);
        this.bulletLifeSpan = 12000;
    }

    this.caughtTarget = false;
    this.anchor.setTo(0.5);
    this.scale.setTo(bulletScale);
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;
    this.events.onRevived.add(this.onRevived, this);
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.bulletLifeSpan;
    this.animations.play('bullet', 20, true);
    this.game.add.tween(this.scale).to({ x: this.scale.x * 1.1, y: this.scale.y * 1.1}, 500, Phaser.Easing.Elastic.None).loop().start();
    this.caughtTarget = false;
};
