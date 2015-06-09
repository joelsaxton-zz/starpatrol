/**
 * Created by joelsaxton on 11/8/14.
 */
StarPatrol.Preload = function(){
    this.ready = false;
};

StarPatrol.Preload.prototype = {
    preload: function() {

        this.game.stage.backgroundColor = '#000000';
        this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        this.splash.anchor.setTo(0.5);

        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('background', 'assets/images/tiles/star-background.png');
        this.load.image('scoreboard-fail', 'assets/images/scoreboard-fail.png');
        this.load.image('scoreboard-win', 'assets/images/scoreboard-win.png');
        this.load.spritesheet('laser', 'assets/images/laser.png', 100, 100, 4);
        this.load.spritesheet('missile', 'assets/images/missile-spritesheet.png', 600, 100, 8);
        this.load.spritesheet('player', 'assets/images/ship-spritesheet.png', 316, 200, 12);
        this.load.spritesheet('asteroid', 'assets/images/asteroid-spritesheet.png', 140, 140, 1);
        this.load.spritesheet('explosion', 'assets/images/explosion-spritesheet.png', 64, 64, 23);
        this.load.spritesheet('big-explosion', 'assets/images/big-explosion-spritesheet.png', 128, 128, 23);
        this.load.spritesheet('alien', 'assets/images/magnetship.png', 150, 120, 4);
        this.load.spritesheet('earth', 'assets/images/earth.png', 250, 250, 1);
        this.load.spritesheet('venus', 'assets/images/venus.png', 250, 250, 1);
        this.load.spritesheet('mercury', 'assets/images/mercury.png', 200, 200, 1);
        this.load.spritesheet('pluto', 'assets/images/pluto.png', 200, 200, 1);
        this.load.spritesheet('neptune', 'assets/images/neptune.png', 300, 300, 1);
        this.load.spritesheet('uranus', 'assets/images/uranus.png', 300, 300, 1);
        this.load.spritesheet('saturn', 'assets/images/saturn.png', 336, 500, 1);
        this.load.spritesheet('jupiter', 'assets/images/jupiter.png', 350, 350, 1);
        this.load.spritesheet('mars', 'assets/images/mars.png', 200, 200, 1);
        this.load.spritesheet('sun', 'assets/images/sun.png', 800, 800, 1);

        this.load.spritesheet('map', 'assets/images/starmap.png', 200, 200, 1);
        this.load.spritesheet('playermap', 'assets/images/playermap-spritesheet.png', 1, 1, 2);
        this.load.spritesheet('alienmap', 'assets/images/alienmap-spritesheet.png', 1, 1, 2);
        this.load.spritesheet('bullet', 'assets/images/bullet-spritesheet.png', 100, 100, 4);

        this.load.audio('gameMusic', ['assets/audio/music.mp3', 'assets/audio/music.ogg']);
        this.load.audio('laser', 'assets/audio/laser.wav');
        this.load.audio('missile', 'assets/audio/missile.wav');
        this.load.audio('nuke', 'assets/audio/missile-new.wav');
        this.load.audio('bullet', 'assets/audio/blip.wav');
        this.load.audio('explosion', 'assets/audio/explosion.wav');
        this.load.audio('big-explosion', 'assets/audio/big-explosion.wav');
        this.load.audio('youblewit', 'assets/audio/youblewit.wav');
        this.load.audio('warp-start', 'assets/audio/warp-start.wav');
        this.load.audio('warp', 'assets/audio/warp.wav');
        this.load.audio('warp-on', 'assets/audio/warp-on.wav');
        this.load.audio('warp-down', 'assets/audio/warp-down.wav');
        this.load.audio('shield-up', 'assets/audio/shield-up.wav');
        this.load.audio('boing', 'assets/audio/boing.wav');
        this.load.audio('applause', 'assets/audio/applause.wav');
        this.load.audio('tractor-beam', 'assets/audio/tractor-beam.wav');
        this.load.audio('bending', 'assets/audio/bending.wav');
        this.load.audio('nuke', 'assets/audio/nuke.wav');

        this.load.bitmapFont('minecraftia', 'assets/fonts/minecraftia/minecraftia.png', 'assets/fonts/minecraftia/minecraftia.xml');
        this.load.onLoadComplete.add(this.onLoadComplete, this);
    },
    create: function() {
        this.preloadBar.cropEnabled = false;
    },
    update: function() {
        if(this.cache.isSoundDecoded('gameMusic') && this.ready === true){
            this.state.start('MainMenu');
        }
    },
    onLoadComplete: function() {
        this.ready = true;
    }
};
