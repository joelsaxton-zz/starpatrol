/**
 * Created by joelsaxton on 11/8/14.
 */
StarPatrol.Game = function () {

    // Scaled physics and values based on this.GAME_SCALE
    this.GAME_SCALE = 0.10;
    this.GAMESIZE = this.GAME_SCALE * 750000;
    this.GRAVITY = this.GAME_SCALE * 2000;
    this.GRAVITYRANGE = this.GAME_SCALE * 8000;
    this.EXPLOSIONSCALE = this.GAME_SCALE * 10;
    this.SMALL_EXPLOSIONSCALE = this.GAME_SCALE * 3;
    this.PLANETSCALE = this.GAME_SCALE * 20;
    this.MAP_PLANETSCALE = this.GAME_SCALE * 120;
    this.DOCK_DISTANCE = this.GAME_SCALE * 3000;

    // Timers
    this.rechargeTimer = 0;
    this.reloadTimer = 0;
    this.warpTimer = 0;
    this.alienInterval = 6000;
    this.alienTimer = 0;
    this.dockTimer = 0;
    this.disembarkTimer = 0;
    this.bonusTimer = 0;
    this.dockInterval = 1500;
    this.disembarkInterval = 100;
    this.bonusInterval = 5000;

    // Scalars
    this.mapSize = 200;
    this.mapOffset = 4;
    this.mapGameRatio = this.mapSize / this.GAMESIZE;
    this.asteroidDensity = 3;
    this.TOTALASTEROIDS = parseInt(this.GAMESIZE / 2000) * this.asteroidDensity;
    this.TOTALALIENS = 1; // How many appear at any one time
    this.orbitSpeedModifier = 0.8;
    this.gameOver = false;
    this.BONUS = 1000;
    this.BONUS_DECREMENT = 100;
    this.bonus = 0;

    // Booleans
    this.upgradePanelVisible = true;
};

StarPatrol.Game.prototype = {
    create: function () {
        // Enable physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.alienTimer = this.game.time.now + this.alienInterval;

        // Add debug plugin
        //this.game.add.plugin(Phaser.Plugin.Debug);

        // Set world size
        this.game.world.setBounds(0, 0, this.GAMESIZE, this.GAMESIZE);

        //  Our tiled scrolling background
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.fixedToCamera = true;

        // Add map sprite
        this.map = this.add.sprite(this.game.width - (this.mapSize) - this.mapOffset, this.mapOffset, 'map');
        this.map.scale.setTo(1); // To match this.mapSize ratio (200px = scale of 1)


        // Build solar system with planet and Planet map sprites
        this.sun = this.add.sprite(this.world.centerX, this.world.centerY, 'sun');
        this.sun.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset * 2 + parseInt(this.sun.x * this.mapGameRatio), parseInt(this.sun.y * this.mapGameRatio) + this.mapOffset, 'sun');
        this.mercury = this.add.sprite(this.world.centerX, this.world.centerY, 'mercury');
        this.mercury.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.mercury.x * this.mapGameRatio), parseInt(this.mercury.y * this.mapGameRatio) + this.mapOffset, 'mercury');
        this.venus = this.add.sprite(this.world.centerX, this.world.centerY, 'venus');
        this.venus.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.venus.x * this.mapGameRatio), parseInt(this.venus.y * this.mapGameRatio) + this.mapOffset, 'venus');
        this.earth = this.add.sprite(this.world.centerX, this.world.centerY, 'earth');
        this.earth.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.earth.x * this.mapGameRatio), parseInt(this.earth.y * this.mapGameRatio) + this.mapOffset, 'earth-map');
        this.mars = this.add.sprite(this.world.centerX, this.world.centerY, 'mars');
        this.mars.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.mars.x * this.mapGameRatio), parseInt(this.mars.y * this.mapGameRatio) + this.mapOffset, 'mars');
        this.jupiter = this.add.sprite(this.world.centerX, this.world.centerY, 'jupiter');
        this.jupiter.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.jupiter.x * this.mapGameRatio), parseInt(this.jupiter.y * this.mapGameRatio) + this.mapOffset, 'jupiter');
        this.saturn = this.add.sprite(this.world.centerX, this.world.centerY, 'saturn');
        this.saturn.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.saturn.x * this.mapGameRatio), parseInt(this.saturn.y * this.mapGameRatio) + this.mapOffset, 'saturn');
        this.uranus = this.add.sprite(this.world.centerX, this.world.centerY, 'uranus');
        this.uranus.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.uranus.x * this.mapGameRatio), parseInt(this.uranus.y * this.mapGameRatio) + this.mapOffset, 'uranus');
        this.neptune = this.add.sprite(this.world.centerX, this.world.centerY, 'neptune');
        this.neptune.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.neptune.x * this.mapGameRatio), parseInt(this.neptune.y * this.mapGameRatio) + this.mapOffset, 'neptune');
        this.pluto = this.add.sprite(this.world.centerX, this.world.centerY, 'pluto');
        this.pluto.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.pluto.x * this.mapGameRatio), parseInt(this.pluto.y * this.mapGameRatio) + this.mapOffset, 'pluto');

        // Set up orbits
        this.au = this.world.width / 80;
        this.mercury.orbit = this.au * 3.2;
        this.venus.orbit = this.au * 5.7;
        this.earth.orbit = this.au * 8.5;
        this.mars.orbit = this.au * 11.8;
        this.jupiter.orbit = this.au * 15.4;
        this.saturn.orbit = this.au * 20;
        this.uranus.orbit = this.au * 25.8;
        this.neptune.orbit = this.au * 32.8;
        this.pluto.orbit = this.au * 38.5;

        //Set up radii for gravity calculations
        this.earth.radius = this.PLANETSCALE * 125 * 0.5;
        this.mercury.radius = this.PLANETSCALE * 100 * 0.5;
        this.venus.radius = this.PLANETSCALE * 125 * 0.5;
        this.mars.radius = this.PLANETSCALE * 100 * 0.5;
        this.jupiter.radius = this.PLANETSCALE * 175 * 0.5;
        this.saturn.radius = this.PLANETSCALE * 175 * 0.5;
        this.uranus.radius = this.PLANETSCALE * 150 * 0.5;
        this.neptune.radius = this.PLANETSCALE * 150 * 0.5;
        this.pluto.radius = this.PLANETSCALE * 100 * 0.5;

        // Fix map to camera
        this.map.fixedToCamera = true;

        // Planets
        this.planets = this.game.add.group();

        // Add planets to group
        this.planets.add(this.earth);
        this.planets.add(this.pluto);
        this.planets.add(this.neptune);
        this.planets.add(this.uranus);
        this.planets.add(this.saturn);
        this.planets.add(this.jupiter);
        this.planets.add(this.mars);
        this.planets.add(this.venus);
        this.planets.add(this.mercury);
        this.saturn.angle = 45;
        this.saturn.map.angle = 45;

        // Set properties
        this.planets.forEach(function (planet) {
            planet.period = 0;
            planet.periodOffset = this.game.rnd.realInRange(-10, 10);
            planet.anchor.setTo(0.5, 0.5);
            planet.scale.setTo(this.PLANETSCALE);
            this.game.physics.arcade.enableBody(planet);
            planet.body.immovable = true;
            planet.map.fixedToCamera = true;
            planet.map.anchor.setTo(0.5, 0.5);
            planet.map.scale.setTo(this.mapGameRatio * this.MAP_PLANETSCALE);
        }, this);

        // Sun
        this.sun.anchor.setTo(0.5, 0.5);
        this.sun.scale.setTo(this.PLANETSCALE * 0.8);
        this.game.physics.arcade.enableBody(this.sun);
        this.sun.body.immovable = true;
        this.sun.map.anchor.setTo(0.5);
        this.sun.map.scale.setTo(this.mapGameRatio * this.MAP_PLANETSCALE * 0.5);
        this.sun.map.x += this.sun.map.width * 0.5;
        this.sun.map.fixedToCamera = true;
        this.sun.radius = this.PLANETSCALE * 400 * 0.5;
        this.planets.add(this.sun);

        // Player parameters
        this.player = new Player(this, this.earth.x, this.earth.y);
        this.game.add.existing(this.player);

        // Space station
        this.station = this.add.sprite(this.world.centerX, this.world.centerY, 'station');
        this.station.anchor.setTo(0.5, 0.5);
        this.station.scale.setTo(0.2);
        this.game.physics.arcade.enableBody(this.station);
        this.station.period = 0;

        // Set Camera
        this.game.camera.follow(this.player);
        this.game.camera.deadzone = new Phaser.Rectangle(this.game.width / 2, this.game.height / 2, this.game.width / 8, this.game.height / 8);
        this.game.camera.focusOnXY(0, 0);

        this.asteroids = this.game.add.group();
        this.asteroids.setAll('anchor.x', 0.5);
        this.asteroids.setAll('anchor.y', 0.5);
        this.asteroids.setAll('checkWorldBounds', true);

        // Create asteroid pool
        while (this.asteroids.countLiving() < this.TOTALASTEROIDS) {
            this.createAsteroid();
        }

        //  Create small explosion pool
        this.smallExplosions = game.add.group();
        for (var i = 0; i < 10; i++) {
            var explosionAnimation = this.smallExplosions.create(0, 0, 'explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(this.SMALL_EXPLOSIONSCALE);
            explosionAnimation.animations.add('explosion');
        }

        //  Create explosion pool
        this.explosions = game.add.group();
        for (var i = 0; i < 50; i++) {
            var explosionAnimation = this.explosions.create(0, 0, 'explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(this.EXPLOSIONSCALE);
            explosionAnimation.animations.add('explosion');
        }

        //  Create big Explosion pool
        this.bigExplosions = game.add.group();
        for (var i = 0; i < 20; i++) {
            var explosionAnimation = this.bigExplosions.create(0, 0, 'big-explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(this.EXPLOSIONSCALE);
            explosionAnimation.animations.add('big-explosion');
        }

        // Add backdrop
        var bmd = game.add.bitmapData(120, 180);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 120, 180);
        bmd.ctx.fillStyle = '#000000';
        bmd.ctx.fill();
        this.blackBackdrop = game.add.sprite(0, 0, bmd);
        this.blackBackdrop.fixedToCamera = true;

        // Set text bitmaps
        this.scoreText = this.game.add.bitmapText(30, 10, 'minecraftia', '', 10);
        this.aliensKilledText = this.game.add.bitmapText(30, 30, 'minecraftia', '', 10);
        this.healthIcon = this.game.add.sprite(10, 48, 'armor');
        this.healthIcon.scale.setTo(0.3);
        this.chargeIcon = this.game.add.sprite(10, 68, 'charge');
        this.chargeIcon.scale.setTo(0.3);
        this.engineIcon = this.game.add.sprite(10, 88, 'engine');
        this.engineIcon.scale.setTo(0.3);
        this.killsIcon = this.game.add.sprite(10, 28, 'kills');
        this.killsIcon.scale.setTo(0.3);
        this.cashIcon = this.game.add.sprite(10, 8, 'dollars');
        this.cashIcon.scale.setTo(0.3);

        // Setup store
        this.engineBuyIcon = this.game.add.sprite(10, 200, 'engine-buy');
        this.engineBuyIcon.scale.setTo(0.4);
        this.engineBuyText = this.game.add.bitmapText(70, 216, 'minecraftia', '$' + this.player.engineCost, 10);
        this.engineBuyIcon.inputEnabled = true;
        this.engineBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.healthBuyIcon = this.game.add.sprite(10, 270, 'armor-buy');
        this.healthBuyIcon.scale.setTo(0.4);
        this.healthBuyText = this.game.add.bitmapText(70, 286, 'minecraftia', '$' + this.player.armorCost, 10);
        this.healthBuyIcon.inputEnabled = true;
        this.healthBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.chargeBuyIcon = this.game.add.sprite(10, 340, 'charge-buy');
        this.chargeBuyIcon.scale.setTo(0.4);
        this.chargeBuyText = this.game.add.bitmapText(70, 356, 'minecraftia', '$' + this.player.chargeCost, 10);
        this.chargeBuyIcon.inputEnabled = true;
        this.chargeBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.missileBuyIcon = this.game.add.sprite(10, 410, 'missile-buy');
        this.missileBuyIcon.scale.setTo(0.4);
        this.missileBuyText = this.game.add.bitmapText(70, 426, 'minecraftia', '$' + this.player.missileCost, 10);
        this.missileBuyIcon.inputEnabled = true;
        this.missileBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.nukeBuyIcon = this.game.add.sprite(10, 480, 'nuke-buy');
        this.nukeBuyIcon.scale.setTo(0.4);
        this.nukeBuyText = this.game.add.bitmapText(70, 496, 'minecraftia', '$' + this.player.nukeCost, 10);
        this.nukeBuyIcon.inputEnabled = true;
        this.nukeBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.shieldBuyIcon = this.game.add.sprite(10, 550, 'shield-buy');
        this.shieldBuyIcon.scale.setTo(0.4);
        this.shieldBuyText = this.game.add.bitmapText(70, 566, 'minecraftia', '$' + this.player.shieldCost, 10);
        this.shieldBuyIcon.inputEnabled = true;
        this.shieldBuyIcon.events.onInputDown.add(this.buyItem, this);

        this.warpBuyIcon = this.game.add.sprite(10, 620, 'warp-buy');
        this.warpBuyIcon.scale.setTo(0.4);
        this.warpBuyText = this.game.add.bitmapText(70, 636, 'minecraftia', '$' + this.player.warpCost, 10);
        this.warpBuyIcon.inputEnabled = true;
        this.warpBuyIcon.events.onInputDown.add(this.buyItem, this);

        var bmd = game.add.bitmapData(84, 10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 128, 128);
        bmd.ctx.fillStyle = '#ffffff';
        bmd.ctx.fill();
        this.healthBarOutline = game.add.sprite(30, 51, bmd);
        this.chargeBarOutline = game.add.sprite(30, 71, bmd);
        this.engineBarOutline = game.add.sprite(30, 91, bmd);

        var bmd = game.add.bitmapData(82, 8);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 128, 128);
        bmd.ctx.fillStyle = '#000000';
        bmd.ctx.fill();
        this.healthBarContainer = game.add.sprite(31, 52, bmd);
        this.chargeBarContainer = game.add.sprite(31, 72, bmd);
        this.engineBarContainer = game.add.sprite(31, 92, bmd);

        var bmd = game.add.bitmapData(80, 6);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 128, 128);
        bmd.ctx.fillStyle = '#00f910';
        bmd.ctx.fill();
        this.healthBar = game.add.sprite(32, 53, bmd);
        this.chargeBar = game.add.sprite(32, 73, bmd);
        this.engineBar = game.add.sprite(32, 93, bmd);

        this.warpText = this.game.add.bitmapText(10, 110, 'minecraftia', 'Warp Drive: ' + (this.player.hasWarpDrive ? this.player.warpDrive : 'none'), 8);
        this.shieldText = this.game.add.bitmapText(10, 120, 'minecraftia', 'Shields: ' + (this.player.hasShields ? this.player.shieldStrength : 'none'), 8);
        this.laserText = this.game.add.bitmapText(10, 130, 'minecraftia', 'Lasers: ' + (this.player.charge >= this.player.LASER_DISCHARGE ? 'ready' : 'charging'), 8);
        this.nukeText = this.game.add.bitmapText(10, 140, 'minecraftia', 'Nukes: ' + this.player.nukes, 8);
        this.missileText = this.game.add.bitmapText(10, 150, 'minecraftia', 'Missiles: ' + this.player.missiles, 8);
        this.bonusText = this.game.add.bitmapText(10, 164, 'minecraftia', 'Bonus: $' + this.bonus, 8);
        this.laserText.tint = 0xFF0000; //
        this.bonusText.tint = 0x66CD00;
        this.scoreText.fixedToCamera = true;
        this.bonusText.fixedToCamera = true;
        this.shieldText.fixedToCamera = true;
        this.nukeText.fixedToCamera = true;
        this.missileText.fixedToCamera = true;
        this.laserText.fixedToCamera = true;
        this.healthIcon.fixedToCamera = true;
        this.chargeIcon.fixedToCamera = true;
        this.engineIcon.fixedToCamera = true;
        this.engineBuyIcon.fixedToCamera = true;
        this.engineBuyText.fixedToCamera = true;
        this.healthBuyIcon.fixedToCamera = true;
        this.healthBuyText.fixedToCamera = true;
        this.chargeBuyIcon.fixedToCamera = true;
        this.missileBuyIcon.fixedToCamera = true;
        this.nukeBuyIcon.fixedToCamera = true;
        this.shieldBuyIcon.fixedToCamera = true;
        this.warpBuyIcon.fixedToCamera = true;
        this.chargeBuyText.fixedToCamera = true;
        this.missileBuyText.fixedToCamera = true;
        this.nukeBuyText.fixedToCamera = true;
        this.shieldBuyText.fixedToCamera = true;
        this.warpBuyText.fixedToCamera = true;
        this.killsIcon.fixedToCamera = true;
        this.cashIcon.fixedToCamera = true;
        this.warpText.fixedToCamera = true;
        this.aliensKilledText.fixedToCamera = true;
        this.healthBar.fixedToCamera = true;
        this.healthBarContainer.fixedToCamera = true;
        this.healthBarOutline.fixedToCamera = true;
        this.chargeBar.fixedToCamera = true;
        this.chargeBarContainer.fixedToCamera = true;
        this.chargeBarOutline.fixedToCamera = true;
        this.engineBar.fixedToCamera = true;
        this.engineBarContainer.fixedToCamera = true;
        this.engineBarOutline.fixedToCamera = true;

        // Set sounds
        this.explosionSound = this.game.add.audio('explosion');
        this.bigExplosionSound = this.game.add.audio('big-explosion');
        this.gameMusic = this.game.add.audio('gameMusic');
        this.youBlewIt = this.game.add.audio('youblewit');
        this.warpStartSound = this.game.add.audio('warp-start');
        this.warpSound = this.game.add.audio('warp');
        this.warpLoopSound = this.game.add.audio('warp-on');
        this.warpDownSound = this.game.add.audio('warp-down');
        this.shieldSound = this.game.add.audio('shield-up');
        this.boingSound = this.game.add.audio('boing');
        this.applauseSound = this.game.add.audio('applause');
        this.bendingSound = this.game.add.audio('bending');
        this.alertSound = this.game.add.audio('alert');
        this.gameMusic.play('', 0, 0.6, true, true);

        // Set inputs
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.shiftkey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        this.nKey = game.input.keyboard.addKey(Phaser.Keyboard.N);
        this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.spacebar.onDown.add(this.player.fireWeapon, this.player);
        this.nKey.onDown.add(this.nextWeapon, this);
        this.dKey.onDown.add(this.dockStation, this);
    },

    update: function () {
        if (!this.gameOver) {
            if (this.player.isAlive) {
                this.updateAllPanels();
                this.updateCamera();
                this.checkPlayerInputs(); // always check inputs before applying gravity
                this.applyGravity();
                this.updateTimers();
                this.checkCollisions();
                this.updateAsteroids();
                this.updateHealth();
                this.updatePlanetPositions();
                this.updateMapPositions();
                this.player.bringToTop();
            }

            if (this.alien) {
                if (this.alien.alive) {
                    this.alien.bringToTop();
                    this.updateAlien();
                }
            }

            this.updateWeapons();
            this.updateEpisode();
            this.checkWin();
        }
    },

    updatePlanetPositions: function () {
        // Update Planets and their orbits
        this.map.bringToTop();
        this.sun.map.bringToTop();

        this.planets.forEach(function (planet) {
            if (planet.key != 'sun') {
                planet.period += this.orbitSpeedModifier / planet.orbit;
                planet.x = this.world.centerX + planet.width * 0.5 + Math.cos(planet.period + planet.periodOffset) * planet.orbit;
                planet.y = this.world.centerY + planet.height * 0.5 + Math.sin(planet.period + planet.periodOffset) * planet.orbit;
                planet.map.fixedToCamera = false;
                planet.map.x = this.game.width - this.mapSize + parseInt(planet.x * this.mapGameRatio) - this.mapOffset;
                planet.map.y = parseInt(planet.y * this.mapGameRatio) + this.mapOffset;
                planet.map.fixedToCamera = true;
                planet.map.bringToTop();
            }
        }, this);

        // Set player start location near Earth and docking location
        if (this.player.isDocked) {
            this.dockPlayer();
        } else if (this.disembarkTimer > this.game.time.now) {
            this.disembarkPlayer();
        } else {
            this.station.period += 1 / this.earth.width;
            this.station.x = this.earth.x + this.station.width * 0.5 + Math.cos(this.station.period) * this.earth.width;
            this.station.y = this.earth.y + this.station.height * 0.5 + Math.sin(this.station.period) * this.earth.width;
        }
    },

    dockPlayer: function () {
        this.earth.scale.setTo(1.5);
        this.earth.angle -= 0.01;
        this.station.scale.setTo(1);
        this.game.camera.follow(this.station);
        this.player.body.allowGravity = false;
        this.station.period += 0.2 / this.earth.width;
        this.station.x = this.earth.x + this.station.width * 0.5 + Math.cos(this.station.period) * this.earth.width * 0.4;
        this.station.y = this.earth.y + this.station.height * 0.5 + Math.sin(this.station.period) * this.earth.height * 0.4;
        this.player.x = this.station.x + this.station.width * 0.5;
        this.player.y = this.station.y - this.station.height * 0.5;
        this.upgradePanelVisible = true;
    },

    disembarkPlayer: function () {
        this.earth.scale.setTo(0.4);
        this.station.scale.setTo(0.2);
        this.game.camera.follow(this.player);
        this.station.period += 1 / this.earth.width;
        this.station.x = this.earth.x + this.station.width * 0.5 + Math.cos(this.station.period) * this.earth.width;
        this.station.y = this.earth.y + this.station.height * 0.5 + Math.sin(this.station.period) * this.earth.width;
        this.player.body.x = this.station.body.x + this.station.width;
        this.player.body.y = this.station.body.y - this.station.width;
        this.upgradePanelVisible = false;
    },

    checkWin: function () {
        if (this.player.aliensKilled == 100) { // @todo revisit
            this.gameMusic.stop();
            this.warpLoopSound.stop();
            this.game.world.bounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);
            this.game.camera.setBoundsToWorld();
            var scoreboard = new Scoreboard(this.game);
            scoreboard.show(this.player.aliensKilled, this.applauseSound, this.explosionSound, true);
            this.killAlien();
            this.gameOver = true;
        }
    },

    updateAllPanels: function () {
        this.healthBar.width = this.player.health * 0.08;
        this.chargeBar.width = this.player.charge * 0.08;
        this.engineBar.width = this.player.ENGINE * 8;

        this.shieldText.text = 'Shields: ' + (this.player.hasShields ? this.player.shieldStrength : 'none');
        this.nukeText.text = 'Nukes: ' + this.player.nukes;
        this.missileText.text = 'Missiles: ' + this.player.missiles;
        this.scoreText.text = this.player.cash;
        this.bonusText.text = 'Bonus: $' + this.bonus;
        this.warpText.text = 'Warp Drive: ' + (this.player.hasWarpDrive ? parseInt(this.player.warpDrive) : 'none');
        this.aliensKilledText.text = this.player.aliensKilled;
        this.laserText.text = 'Lasers: ' + (this.player.charge >= this.player.LASER_DISCHARGE ? 'ready' : 'charging');

        if (this.upgradePanelVisible) {
            if (this.player.ENGINE != this.player.MAXENGINE) {
                this.engineBuyIcon.revive();
                this.engineBuyText.text = '$' + this.player.engineCost;
            }

            this.healthBuyIcon.revive();
            this.chargeBuyIcon.revive();
            this.healthBuyText.text = '$' + this.player.armorCost;
            this.chargeBuyText.text = '$' + this.player.chargeCost;

            if (this.player.missiles < this.player.MAX_MISSILES) {
                this.missileBuyIcon.revive();
                this.missileBuyText.text = '$' + this.player.missileCost;
            }

            if (this.player.nukes < this.player.MAX_NUKES) {
                this.nukeBuyIcon.revive();
                this.nukeBuyText.text = '$' + this.player.nukeCost;
            }
            if (!this.player.hasWarpDrive) {
                this.warpBuyIcon.revive();
                this.warpBuyText.text = '$' + this.player.warpCost;
            }
            if (!this.player.hasShields) {
                this.shieldBuyIcon.revive();
                this.shieldBuyText.text = '$' + this.player.shieldCost;
            }

        } else {
            this.engineBuyIcon.kill();
            this.healthBuyIcon.kill();
            this.chargeBuyIcon.kill();
            this.missileBuyIcon.kill();
            this.nukeBuyIcon.kill();
            this.warpBuyIcon.kill();
            this.shieldBuyIcon.kill();
            this.engineBuyText.text = '';
            this.healthBuyText.text = '';
            this.chargeBuyText.text = '';
            this.missileBuyText.text = '';
            this.nukeBuyText.text = '';
            this.shieldBuyText.text = '';
            this.warpBuyText.text = '';
        }

    },

    buyItem: function (button) {
        switch (button.key) {
            case 'engine-buy':
                this.player.upgradeShip('engine');
                break;
            case 'armor-buy':
                this.player.upgradeShip('health');
                break;
            case 'charge-buy':
                this.player.upgradeShip('charge');
                break;
            case 'missile-buy':
                this.player.upgradeShip('missile');
                break;
            case 'nuke-buy':
                this.player.upgradeShip('nuke');
                break;
            case 'shield-buy':
                this.player.upgradeShip('shield');
                break;
            case 'warp-buy':
                this.player.upgradeShip('warp');
                break;
            default:
                break;
        }
    },

    updateHealth: function () {
        if (this.player.health <= 0) {
            this.killPlayer(true);
            this.gameOver = true;
        }

        // Subtract health if shield was brought below zero
        if (this.player.shieldStrength < 0) {
            this.player.health += this.player.shieldStrength;
            this.player.shieldStrength = 0;
        }

        // Update alien health
        if (this.alien) {
            if (this.alien.health <= 0 && this.alien.alive) {
                this.killAlien();
            }
        }
    },

    updateCamera: function () {
        this.background.tilePosition.x = -game.camera.x;
        this.background.tilePosition.y = -game.camera.y;
    },

    updateMapPositions: function () {
        this.player.map.fixedToCamera = false;
        this.player.map.x = this.game.width - this.mapSize + parseInt(this.player.x * this.mapGameRatio) - this.mapOffset;
        this.player.map.y = parseInt(this.player.y * this.mapGameRatio) + this.mapOffset;
        this.player.map.fixedToCamera = true;
        this.player.map.bringToTop();

        if (this.alien && this.alien.alive) {
            this.alienmap.fixedToCamera = false;
            this.alienmap.x = this.game.width - this.mapSize + parseInt(this.alien.x * this.mapGameRatio) - this.mapOffset;
            this.alienmap.y = parseInt(this.alien.y * this.mapGameRatio) + this.mapOffset;
            this.alienmap.fixedToCamera = true;
            this.alienmap.bringToTop();
        }
    },

    nextWeapon: function () {
        switch (this.player.selectedWeapon) {
            case 'laser':
                this.player.selectedWeapon = 'nuke';
                this.laserText.tint = 0xFFFFFF;
                this.nukeText.tint = 0xFF0000;
                break;
            case 'nuke':
                this.player.selectedWeapon = 'missile';
                this.nukeText.tint = 0xFFFFFF;
                this.missileText.tint = 0xFF0000;
                break;
            case 'missile':
                this.player.selectedWeapon = 'laser';
                this.missileText.tint = 0xFFFFFF;
                this.laserText.tint = 0xFF0000;
                break;
        }
    },

    checkPlayerInputs: function () {
        // Constrain velocity

        // Check if player is stuck in alien tar
        var tar = (this.alien && this.alien.tar) ? this.alien.tar : 1;

        if (this.player.isWarping) {
            this.player.animations.play('warp', 10, true);
            this.constrainVelocity(this.player, this.player.WARPVELOCITY / tar);
        } else if (this.player.inGravitationalField) {
            this.constrainVelocity(this.player, this.player.SLINGSHOT_VELOCITY / tar);
        } else {
            this.constrainVelocity(this.player, this.player.VELOCITY / tar);
        }

        // Decide animation
        if (!this.cursors.up.isDown) {
            if (!this.player.isShielded && !this.player.isWarping) {
                this.player.animations.play('drift', 10, true);
            }
        }

        // Check if player is warping too close to tractor beam being used on him
        if (this.player.isWarping && this.alien.isTractorBeamOn && this.alien.target == this.player && this.game.physics.arcade.distanceBetween(this.alien, this.player) < this.player.MINSAFEWARPDISTANCE) {
            this.player.health -= 0.2;
            this.warpSound.stop();
            this.warpLoopSound.stop();
            this.warpStartSound.stop();
            this.bendingSound.play('', 0, 1, false, false);
            return;
        }
        // use shields
        if (this.shiftkey.isDown && this.player.hasShields && !this.player.isWarping && this.player.charge > 0 && this.player.shieldStrength > 0) {
            this.player.charge -= this.player.SHIELD_DISCHARGE;
            this.player.animations.play('shield', 20, true);
            // play shield-on sound
            if (!this.player.isShielded) {
                this.shieldSound.play('', 0, 0.05, false);
            }
            this.player.isShielded = true;

        } else if (this.player.isShielded) {
            this.player.isShielded = false;
            this.player.animations.play('drift', 10, true);
        }
        // Use warp drive
        if (this.cursors.down.isDown && this.player.hasWarpDrive && this.player.warpDrive > 0) {
            // play warp-on sound
            if (!this.player.isWarping) {
                this.warpSound.play('', 0, 0.5, false);
                this.warpStartSound.play('', 0, 0.8, false);
            }
            // play warp loop sound
            if (!this.warpLoopSound.isPlaying) {
                this.warpLoopSound.play('', 0, 0.05, true);
            }
            this.player.isWarping = true;
            this.player.warpDrive -= this.player.WARP_DISCHARGE;
            var x_component = Math.cos((this.player.angle) * Math.PI / 180);
            var y_component = Math.sin((this.player.angle) * Math.PI / 180);
            this.player.body.velocity.x += (this.player.THRUST/tar) * this.player.warpModifier * x_component;
            this.player.body.velocity.y += (this.player.THRUST/tar) * this.player.warpModifier * y_component;
        } else if (this.player.isWarping) {
            this.player.isWarping = false;
            this.warpDownSound.play('', 0, 0.8, false);
            this.warpLoopSound.stop();
        }

        // Change direction and thrust only if not warping
        if (!this.player.isWarping) {
            // Thrust
            if (this.cursors.up.isDown) {
                if (!this.player.isShielded) this.player.animations.play('thrust');
                if (this.player.isDocked) {
                    this.player.isDocked = false;
                    this.dockTimer = this.game.time.now + this.dockInterval;
                    this.player.isDisembarking = true;
                }
                if (this.player.isDisembarking) {
                    this.disembarkTimer = this.game.time.now + this.disembarkInterval;
                    this.player.isDisembarking = false;
                }
                var x_component = Math.cos((this.player.angle) * Math.PI / 180);
                var y_component = Math.sin((this.player.angle) * Math.PI / 180);
                this.player.body.velocity.x += (this.player.THRUST/tar) * x_component;
                this.player.body.velocity.y += (this.player.THRUST/tar) * y_component;
            }
            // turn RIGHT
            if (this.cursors.right.isDown) {   //  Move to the right
                this.player.angle += this.player.TURNRATE;

            } // turn LEFT
            else if (this.cursors.left.isDown) {   //  Move to the left
                this.player.angle -= this.player.TURNRATE;
            }
        }
    },

    // Ship max velocity
    constrainVelocity: function (sprite, maxVelocity) {
        if (!sprite || !sprite.body) {
            return;
        }
        var body = sprite.body;
        var angle, currVelocitySqr, vx, vy;
        vx = body.velocity.x;
        vy = body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;
        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            body.velocity.x = vx;
            body.velocity.y = vy;
        }
    },

    updateWeapons: function () {
        this.player.updateWeapons();

        if (this.alien) {
            this.alien.updateWeapons();
        }
    },

    updateAlien: function () {
        if (this.player.isDocked) {
            this.alien.speed = 0;
        } else {
            this.alien.update();
        }
    },

    updateAsteroids: function () {
        if (this.asteroids.countLiving() < this.TOTALASTEROIDS) {
            this.createAsteroid();
        }
    },

    applyGravity: function () {

        this.player.inGravitationalField = false;

        this.planets.forEach(function (planet) {
            var planet_x = planet.x + planet.radius;
            var planet_y = planet.y + planet.radius;
            this.distanceFromPlanet = Math.sqrt(Math.pow(planet_x - this.player.body.x, 2) + Math.pow(planet_y - this.player.body.y, 2));
            var range = (planet.key != 'sun') ? this.GRAVITYRANGE : this.GRAVITYRANGE * 2;
            var gravity = this.GRAVITY;

            // Gravity
            if (this.distanceFromPlanet < range && !this.player.isDocked) {
                this.player.inGravitationalField = true;
                this.player.body.allowGravity = true;
                this.player.body.gravity = new Phaser.Point(planet_x - this.player.body.x, planet_y - this.player.body.y);
                this.player.body.gravity = this.player.body.gravity.normalize().multiply(gravity, gravity);
                return;
            }
        }, this);

        if (!this.player.inGravitationalField) {
            this.player.body.allowGravity = false;
        }

    },

    updateEpisode: function () {
        //Alien appearance timer
        if (this.alienTimer < this.game.time.now) {
            if (!this.aliens) {
                this.aliens = this.game.add.group();
                this.alien = this.createAlien();
                this.aliens.add(this.alien);
                this.alienmap = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.alien.x * this.mapGameRatio), parseInt(this.alien.y * this.mapGameRatio) + this.mapOffset, 'alienmap');
                this.alienmap.fixedToCamera = true;
                this.alienmap.anchor.setTo(0.5);
                this.alienmap.scale.setTo(3);
                this.alienmap.animations.add('tracking', [0, 1]);
                this.alienmap.animations.play('tracking', 10, true);
            }

            this.alienTimer = this.game.time.now + this.alienInterval;
            if (this.aliens.countLiving() < this.TOTALALIENS) {
                this.alien = this.createAlien();
                this.aliens.add(this.alien);
                this.alienmap.revive();
            }
        }
    },

    updateTimers: function () {
        // Reload timer
        if (this.reloadTimer < this.game.time.now) {
            this.reloadTimer = this.game.time.now + this.player.RELOAD_INTERVAL;
            this.player.isReloaded = true;
        }
        // Recharge battery timer
        if (this.rechargeTimer < this.game.time.now) {
            this.rechargeTimer = this.game.time.now + this.player.RECHARGE_INTERVAL;
            if (this.player.charge < this.player.CHARGE) {
                this.player.charge++;
            }

            if (this.alien) {
                if (this.alien.charge < this.alien.MAXCHARGE) {
                    this.alien.charge++;
                }
                if (this.alien.tractorBeam < this.alien.MAXCHARGE) {
                    this.alien.tractorBeam++;
                }
                if (this.alien.deathRayCharge < this.alien.MAXCHARGE) {
                    this.alien.deathRayCharge++;
                }
            }
        }
        // Recharge warp drive
        if (this.warpTimer < this.game.time.now) {
            this.warpTimer = this.game.time.now + this.player.WARP_INTERVAL;
            if (this.player.warpDrive < this.player.CHARGE) {
                this.player.warpDrive++;
            }
        }
        // Bonus timer
        if (this.bonusTimer < this.game.time.now) {
            this.bonusTimer = this.game.time.now + this.bonusInterval;
            this.bonus -= this.BONUS_DECREMENT;
            if (this.bonus < 0) this.bonus = 0;
        }

    },

    checkCollisions: function () {

        // Check space station docking
        this.game.physics.arcade.collide(this.player.missilegroup, this.asteroids, this.missileAsteroidHit, null, this);
        this.game.physics.arcade.collide(this.player, this.asteroids, this.playerAsteroidHit, null, this);
        this.game.physics.arcade.collide(this.player.missilegroup, this.planets, this.missilePlanetHit, null, this);
        this.game.physics.arcade.collide(this.asteroids, this.planets, this.asteroidPlanetHit, null, this);

        if (this.aliens) {
            this.game.physics.arcade.collide(this.player.missilegroup, this.alien.bullets, this.missileBulletHit, null, this);
            this.game.physics.arcade.collide(this.aliens, this.asteroids, this.alienAsteroidHit, null, this);
            this.game.physics.arcade.collide(this.player, this.alien.bullets, this.playerWeaponHit, null, this);
            this.game.physics.arcade.collide(this.planets, this.alien.bullets, this.planetBulletHit, null, this);
            this.game.physics.arcade.collide(this.asteroids, this.alien.bullets, this.asteroidBulletHit, null, this);
            this.game.physics.arcade.collide(this.player.lasers, this.aliens, this.laserAlienHit, null, this);
            this.game.physics.arcade.collide(this.player, this.aliens, this.playerAlienHit, null, this);
            this.game.physics.arcade.collide(this.player.missilegroup, this.aliens, this.missileAlienHit, null, this);
            if (this.alien.hasDeathRay) {
                this.game.physics.arcade.collide(this.player, this.alien.deathrays, this.playerDeathRayHit, null, this);
            }
        }

    },

    createAlien: function () {

        var rand = this.game.rnd.integerInRange(0, this.player.aliensKilled);
        this.alertSound.play('', 0, 0.6, false, false);

        if (rand <= 2) {
            this.bonus = this.BONUS;
            var x = this.mercury.x;
            var y = this.mercury.y;
            return new Sputnik(this, this.player, this.GAME_SCALE, x, y);
        }

        if (rand >= 3 && rand <= 6) {
            this.bonus = this.BONUS * 1.5;
            var x = this.venus.x;
            var y = this.venus.y;
            return new Drill(this, this.player, this.GAME_SCALE, x, y);
        }

        if (rand >= 7 && rand <= 10) {
            this.bonus = this.BONUS * 2;
            var x = this.mars.x;
            var y = this.mars.y;
            return new Magnet(this, this.player, this.GAME_SCALE, x, y);
        }

        if (rand >= 11) {
            this.bonus = this.BONUS * 3;
            var x = this.jupiter.x;
            var y = this.jupiter.y;
            return new Ufo(this, this.player, this.GAME_SCALE, x, y);
        }


    },

    createAsteroid: function () {
        var asteroid = this.asteroids.getFirstDead();
        if (!asteroid) {
            var start = this.game.rnd.integerInRange(1, 4);

            switch (start) {
                case 1:
                    var x = this.game.world.bounds.width;
                    var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                    var direction = 1;
                    break;
                case 2:
                    var x = 0;
                    var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                    var direction = 2;
                    break;
                case 3:
                    var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                    var y = this.game.world.bounds.height;
                    var direction = 3;
                    break;
                case 4:
                    var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                    var y = 0;
                    var direction = 4;
                    break;
            }

            asteroid = new Asteroid(this.game, this.GAME_SCALE, x, y, direction);
            this.asteroids.add(asteroid);
        }

        asteroid.reset(asteroid.startX, asteroid.startY);
        asteroid.revive();
    },

    detonate: function (object, framerate, big, type) {
        if (big) {
            var explosionAnimation = this.bigExplosions.getFirstExists(false);
            explosionAnimation.reset(object.x, object.y);
            explosionAnimation.play('big-explosion', framerate, false, true);
            this.bigExplosionSound.play('', 0, 0.8, false, true);
        } else {
            var explosionAnimation = this.explosions.getFirstExists(false);
            explosionAnimation.reset(object.x, object.y);
            explosionAnimation.play('explosion', framerate, false, true);
            this.explosionSound.play('', 0, 0.2, false, true);
        }

        if (type == 'destroy') {
            object.destroy();
        } else if (type == 'kill') {
            object.kill();
        }
    },

    missilePlanetHit: function (missile, planet) {
        this.detonate(missile, 100, false, 'kill');
    },

    asteroidPlanetHit: function (asteroid, planet) {
        this.detonate(asteroid, 100, false, 'kill');
    },

    missileAsteroidHit: function (missile, asteroid) {
        this.detonate(missile, 100, false, 'destroy');
        this.detonate(asteroid, 100, false, 'kill');
    },

    missileAlienHit: function (missile, alien) {
        this.alien.wasHit = true;
        this.player.missileSound.stop();
        this.player.nukeSound.stop();
        this.detonate(missile, 50, false, 'destroy');
        this.alien.health -= missile.damage;
    },

    laserAlienHit: function (laser, alien) {
        this.alien.wasHit = true;
        this.explosionSound.play('', 0, 0.5, false, true);
        this.detonate(laser, 100, false, 'kill');
        this.alien.health -= laser.damage;
    },

    alienAsteroidHit: function (alien, asteroid) {
        this.detonate(asteroid, 100, false, 'kill');
        this.alien.health -= asteroid.damage;
    },

    playerPlanetHit: function (ship, planet) {
        this.explosionSound.play('', 0, 0.1, false, true);
    },

    alienPlanetHit: function (ship, planet) {
        ship.avoidObstacle();
    },

    planetBulletHit: function (planet, bullet) {
        this.detonate(bullet, 100, false, 'destroy');
    },

    asteroidBulletHit: function (asteroid, bullet) {
        this.detonate(asteroid, 100, false, 'kill');
        this.detonate(bullet, 100, false, 'destroy');
    },

    missileBulletHit: function (missile, bullet) {
        this.detonate(missile, 100, false, 'destroy');
        this.detonate(bullet, 100, false, 'destroy');
    },

    playerWeaponHit: function (player, bullet) {

        if (bullet.key == 'ufo-bullet') {
            this.alien.catchTarget(bullet);
            return;
        }
        if (this.player.isShielded) {
            this.boingSound.play('', 0, 0.1, false);
            this.player.shieldStrength -= this.alien.WEAPON_DAMAGE;
            bullet.destroy();
            return;
        }
        this.detonate(bullet, 50, false, 'destroy');

        // if player collides with anything while warping, increase damage
        if (this.player.isWarping) {
            this.player.health -= this.alien.WEAPON_DAMAGE * 3;
        } else {
            this.player.health -= this.alien.WEAPON_DAMAGE;
        }
    },

    playerDeathRayHit: function (player, ray) {
        this.detonate(ray, 50, false, 'destroy');
        this.player.health -= this.alien.WEAPON_DAMAGE;
    },

    playerAsteroidHit: function (player, asteroid) {

        if (this.player.isShielded) {
            this.boingSound.play('', 0, 0.1, false);
            this.player.shieldStrength -= asteroid.damage;
            return;
        }

        this.detonate(asteroid, 100, false, 'kill');
        this.player.health -= asteroid.damage;

        // if player collides with anything while warping, increase damage
        if (this.player.isWarping) {
            this.player.health -= asteroid.damage * 3;
        } else {
            this.player.health -= asteroid.damage;
        }
    },

    playerAlienHit: function () {
        this.explosionSound.play('', 0, 0.1, false, true);
        if (this.alien.key == 'sputnik') {
            this.player.health -= this.alien.COLLISION_DAMAGE;
            this.detonate(this.player, 100, false, 'hit');
        }
        if (this.alien.isTractorBeamOn) {
            this.bendingSound.play('', 0, 1, false, true);
            this.player.health -= this.alien.TRACTORBEAM_DAMAGE;
        } else {
            this.alien.avoidObstacle();
        }
    },

    dockStation: function () {
        if (this.dockTimer < this.game.time.now
            && this.game.physics.arcade.distanceBetween(this.player, this.station) < this.DOCK_DISTANCE) {
            this.player.isDocked = true;
        }
    },

    killPlayer: function (playerKilled) {
        this.player.isAlive = false;
        this.gameMusic.stop();
        this.explosionSound.play('', 0, 1, false, true);
        if (playerKilled) {
            var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
            bigExplosionAnimation.reset(this.player.x, this.player.y);
            this.player.kill();
        } else {
            var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
        }
        bigExplosionAnimation.play('big-explosion', 20, false, true).onComplete.add(function () {
            this.game.world.bounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);
            this.game.camera.setBoundsToWorld();
            var scoreboard = new Scoreboard(this.game);
            scoreboard.show(this.player.aliensKilled, this.youBlewIt, this.explosionSound, false);
            if (this.warpLoopSound.isPlaying) {
                this.warpLoopSound.stop();
            }
            this.shieldText.text = '';
            this.laserText.text = '';
            this.nukeText.text = '';
            this.missileText.text = '';
            this.warpText.text = '';
            this.bonusText.text = '';
        }, this);

        if (this.alien) {
            this.alien.die();
            this.alienmap.kill();
            this.alien.destroy();
        }
    },

    killAlien: function () {
        this.alien.die();
        this.alienmap.kill();
        this.player.cash += this.alien.KILL_SCORE + this.bonus;
        this.explosionSound.play('', 0, 1, false, true);
        this.bigExplosionSound.play('', 0, 1, false, true);
        var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
        bigExplosionAnimation.reset(this.alien.x, this.alien.y);
        bigExplosionAnimation.play('big-explosion', 500, false, true);
        this.player.aliensKilled++;
        this.alien.destroy();
        this.bonus = 0;
    },

    shutdown: function () {
        this.player.missilegroup.destroy();
        this.player.lasers.destroy();
        this.asteroids.destroy();
        this.explosions.destroy();
        this.bigExplosions.destroy();
        this.aliens.destroy();
        this.player.cash = 0;
        this.player.aliensKilled = 0;
        this.gameOver = false;
    }
}