/**
 * Created by joelsaxton on 11/8/14.
 */
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

game.state.add('Boot', StarPatrol.Boot);
game.state.add('Preloader', StarPatrol.Preload);
game.state.add('MainMenu', StarPatrol.MainMenu);
game.state.add('Game', StarPatrol.Game);

game.state.start('Boot');