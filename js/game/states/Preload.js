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
        this.load.spritesheet('laser', 'assets/images/laser.png', 100, 25, 1);
        this.load.spritesheet('missile', 'assets/images/missile-spritesheet.png', 600, 100, 8);
        this.load.spritesheet('player', 'assets/images/ship-spritesheet.png', 316, 200, 12);
        this.load.spritesheet('asteroid', 'assets/images/asteroid-spritesheet.png', 140, 140, 1);
        this.load.spritesheet('explosion', 'assets/images/explosion-spritesheet.png', 64, 64, 23);
        this.load.spritesheet('big-explosion', 'assets/images/big-explosion-spritesheet.png', 128, 128, 23);
        this.load.spritesheet('flametrail', 'assets/images/flametrail-spritesheet.png', 32, 32, 23);
        this.load.spritesheet('smoketrail', 'assets/images/smoketrail-spritesheet.png', 16, 16, 23);
        this.load.spritesheet('magnet', 'assets/images/magnetship.png', 150, 120, 4);
        this.load.spritesheet('sputnik', 'assets/images/sputnik.png', 200, 120, 4);
        this.load.spritesheet('drill', 'assets/images/drillship.png', 220, 59, 1);
        this.load.spritesheet('chainsaw', 'assets/images/chainsaw.png', 400, 145, 2);
        this.load.spritesheet('earth', 'assets/images/earth-large.png', 1000, 1000, 1);
        this.load.spritesheet('earth-map', 'assets/images/earth.png', 250, 250, 1);
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
        this.load.spritesheet('drill-bullet', 'assets/images/drill-bullet.png', 40, 40, 1);
        this.load.spritesheet('armor', 'assets/images/armor.png', 50, 60, 1);
        this.load.spritesheet('armor-buy', 'assets/images/health-buy.png', 115, 110, 1);
        this.load.spritesheet('charge', 'assets/images/charge.png', 50, 60, 1);
        this.load.spritesheet('charge-buy', 'assets/images/charge-buy.png', 115, 110, 1);
        this.load.spritesheet('engine', 'assets/images/engine.png', 50, 60, 1);
        this.load.spritesheet('engine-buy', 'assets/images/engine-buy.png', 115, 110, 1);
        this.load.spritesheet('missile-buy', 'assets/images/missile-buy.png', 115, 110, 1);
        this.load.spritesheet('nuke-buy', 'assets/images/nuke-buy.png', 115, 110, 1);
        this.load.spritesheet('shield-buy', 'assets/images/shield-buy.png', 115, 110, 1);
        this.load.spritesheet('warp-buy', 'assets/images/warp-buy.png', 115, 110, 1);
        this.load.spritesheet('kills', 'assets/images/kills.png', 50, 60, 1);
        this.load.spritesheet('dollars', 'assets/images/dollar.png', 50, 60, 1);
        this.load.spritesheet('station', 'assets/images/station.png', 348, 326, 1);
        this.load.spritesheet('flameship', 'assets/images/flameship.png', 259, 134, 1);
        this.load.spritesheet('flame', 'assets/images/flame.png', 320, 109, 7);
        this.load.spritesheet('ufo', 'assets/images/ufo.png', 300, 300, 5);
        this.load.spritesheet('ufo-bullet', 'assets/images/ufo-bullet.png', 100, 100, 4);
        this.load.spritesheet('deathray', 'assets/images/deathray.png', 120, 40, 1);
        this.load.spritesheet('panel', 'assets/images/panel.png', 120, 180, 1);

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
        this.load.audio('alert', 'assets/audio/alert.wav');
        this.load.audio('suicide', 'assets/audio/bounce.wav');
        this.load.audio('drill', 'assets/audio/drill.wav');
        this.load.audio('flame', 'assets/audio/flame.wav');
        this.load.audio('invisible', 'assets/audio/invisible.wav');
        this.load.audio('burning', 'assets/audio/burning.wav');
        this.load.audio('launchGas', 'assets/audio/fart1.wav');
        this.load.audio('fart', 'assets/audio/fart.wav');
        this.load.audio('deathRay', 'assets/audio/death-ray.wav');
        this.load.audio('chainsaw', 'assets/audio/chainsaw.wav');
        this.load.audio('chainsaw-idle', 'assets/audio/chainsaw-idle.wav');
        this.load.audio('chainsaw-attack', 'assets/audio/chainsaw-attack.wav');

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
