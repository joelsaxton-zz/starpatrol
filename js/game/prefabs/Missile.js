/**
 * Created by joelsaxton on 11/9/14.
 */

var Missile = function(game, missileScale, player_xvel, player_yvel, x, y, angle, key, frame){
    key = 'missile';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.scale.setTo(missileScale);
    this.thrust = 8;
    this.anchor.setTo(0.5);
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.angle = angle;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;
    this.missileLaunchTime = 2000;
    this.missileLifeSpan = 10000;
    this.events.onRevived.add(this.onRevived, this);
    this.xvel = player_xvel;
    this.yvel = player_yvel;
};

Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.missileLifeSpan;
    this.launchtime = this.game.time.now + this.missileLaunchTime;
    this.body.velocity.x = this.xvel * 0.5;
    this.body.velocity.y = this.yvel * 0.5;
};
