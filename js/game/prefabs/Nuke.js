/**
 * Created by joelsaxton on 12/6/14.
 */

var Nuke = function(game, nukeScale, x, y, key, frame){
    key = 'plasma';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.scale.setTo(nukeScale);
    this.anchor.setTo(0.5);
    this.animations.add('plasma');
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.checkWorldBounds = false;
    this.outOfBoundsKill = false;
    this.nukeLifeSpan = 12000;
    this.events.onRevived.add(this.onRevived, this);
};

Nuke.prototype = Object.create(Phaser.Sprite.prototype);
Nuke.prototype.constructor = Nuke;

Nuke.prototype.onRevived = function() {
    this.lifespan = this.game.time.now + this.nukeLifeSpan;
    this.animations.play('plasma', 20, true);
};

