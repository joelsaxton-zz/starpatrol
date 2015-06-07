/**
 * Created by joelsaxton on 11/10/14.
 */

var Alien = function(game, x, y, charge, health, scale, key, frame){
    key = 'alien';
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.id = game.rnd.uuid();
    this.anchor.setTo(0.5);
    this.scale.setTo(scale * 2);
    this.maxcharge = charge;
    this.maxhealth = health;
    this.charge = this.maxcharge;
    this.tractorBeam = this.maxcharge;
    this.isTractorBeamOn = false;
    this.health = this.maxhealth;
    this.target = null;
    this.alive = true;
    game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(0.8);
    this.events.onRevived.add(this.onRevived, this);
    this.turnRate = 1.5;
    this.speed = 0;
    this.minAttackDistance = 60;
    this.isAttacking = true;
    this.isSlowing = false;

};

Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;

Alien.prototype.onRevived = function() {
    this.charge = this.maxcharge;
    this.health = this.maxhealth;
    this.alive = true;
    this.isAttacking = true;
    this.isSlowing = false;
};