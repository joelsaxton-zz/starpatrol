/**
 * Created by joelsaxton on 11/9/14.
 */

var Missile = function(isNuke, game, missileScale, x, y, angle, key, frame){
    key = 'missile';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.scale.setTo(missileScale);
    this.anchor.setTo(0.5,0.5);
    this.game.physics.arcade.enableBody(this);
    this.events.onRevived.add(this.onRevived, this);
    this.body.allowGravity = false;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;

    this.angle = angle;
    this.thrust = (isNuke) ? 12 : 16;
    this.missileLaunchTime = (isNuke) ? 2000 : 500;
    this.missileLifeSpan = (isNuke) ? 24000 : 10000;
    this.TURN_RATE = (isNuke) ? 1.8 : 3.0; // turn rate in degrees/frame
    this.MAX_SPEED = (isNuke) ? 700 : 400;
    this.WOBBLE_LIMIT = (isNuke) ? 10 : 20; // degrees
    this.WOBBLE_SPEED = (isNuke) ? 300 : 100; // milliseconds
    this.damage = (isNuke) ? 100 : 20;
    this.speed = 0;

    this.game.add.tween(this)
        .to(
        { wobble: -this.WOBBLE_LIMIT },
        this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
        Number.POSITIVE_INFINITY, true
    );
};

Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.missileLifeSpan;
    this.launchtime = this.game.time.now + this.missileLaunchTime;
    this.speed = 0;
};
