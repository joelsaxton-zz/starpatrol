/**
 * Created by joelsaxton on 11/8/14.
 */
StarPatrol.MainMenu = function() {};

StarPatrol.MainMenu.prototype = {
    create: function() {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-100, -100);

        this.player = this.add.sprite(200, this.game.height/2, 'player');
        this.player.anchor.setTo(0.5);
        this.player.scale.setTo(0.75);
        this.player.animations.add('demo', [6,7]);
        this.player.animations.play('demo', 10, true);
        this.player.angle = 45;

        this.alien = this.add.sprite(900, this.game.height/2, 'flameship');
        this.alien.anchor.setTo(0, 0.5);
        this.alien.scale.setTo(0.75);
        this.alien.angle = 45;


        this.smokeEmitter = this.add.emitter(0, 0, 100);
        this.smokeEmitter.lifespan = 5000;
        // Set motion parameters for the emitted particles
        this.smokeEmitter.gravity = 0;
        this.smokeEmitter.setXSpeed(-310, -300);
        this.smokeEmitter.setYSpeed(-310, -300);

        this.smokeEmitter.setAlpha(0.5, 0, this.smokeEmitter.lifespan,
            Phaser.Easing.Linear.InOut);

        // Create the actual particles
        this.smokeEmitter.makeParticles('explosion', [3,4,5,6,7,8,9,10], 100, true);

        // Start emitting smoke particles one at a time (explode=false) with a
        // lifespan of this.SMOKE_LIFETIME at 100ms intervals
        this.smokeEmitter.start(false, this.smokeEmitter.lifespan, 50);


        this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        this.splash.anchor.setTo(0.5);

        this.instructionText = this.game.add.bitmapText(0,0, 'minecraftia', 'ARROWS - move, SPACE - fire, N - switch weapon, SHIFT - shields, D - dock', 12);
        this.instructionText.x = this.game.width / 2 - this.instructionText.textWidth / 2;
        this.instructionText.y = this.game.height / 1.8 + this.splash.height /2;

        this.startText = this.game.add.bitmapText(0,0, 'minecraftia', 'click to start', 16);
        this.startText.x = this.game.width / 2 - this.startText.textWidth / 2;
        this.startText.y = this.game.height / 2 + this.splash.height /2;
    },
    update: function() {
        this.smokeEmitter.x = this.alien.x;
        this.smokeEmitter.y = this.alien.y;
        if(this.game.input.activePointer.justPressed()){
            this.game.state.start('Game');
        }
    }
}