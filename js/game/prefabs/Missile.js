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
    this.thrust = (isNuke) ? 8 : 12;
    this.missileLaunchTime = (isNuke) ? 2000 : 500;
    this.missileLifeSpan = (isNuke) ? 10000 : 6000;
    this.TURN_RATE = (isNuke) ? 2.4 : 3.2; // turn rate in degrees/frame
    this.MAX_SPEED = (isNuke) ? 1000 : 600;
    this.WOBBLE_LIMIT = (isNuke) ? 3 : 6; // degrees
    this.WOBBLE_SPEED = (isNuke) ? 400 : 200; // milliseconds
    this.damage = (isNuke) ? 120 : 30;
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
