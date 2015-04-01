Lottery.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
	
    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};
var xlocs, ylocs;
var LOCS, index;
var layer, map, leftKey, rightKey, spaceKey, upKey, downKey, aKey, sKey, dKey, wKey;
var player, baddies, bulletgroup;
var timeMark, dirFlag, portMark;
var ENEMYSPEED, isShooting, text1, text2;
Lottery.Game.prototype = {
    create: function () {
	////Initialize/////////////////////////////////////////////////////////////////////////////////////
		xlocs = [3*32, 18*32, 5*32, 10*32, 11*32, 16*32, 5*32, 10*32, 11*32, 16*32, 5*32, 10*32, 11*32, 16*32, 5*32, 10*32, 11*32, 16*32, 3*32, 18*32];
		ylocs = [3*32, 3*32, 5*32, 5*32, 5*32, 5*32, 10*32, 10*32, 10*32, 10*32, 11*32, 11*32, 11*32, 11*32, 16*32, 16*32, 16*32, 16*32, 18*32, 18*32];
		LOCS = 20;
		ENEMYSPEED = 300;
		isShooting = false;
		text1 = this.game.add.text(15*32, 0, "Ammunition: ", {font: "15px Arial", fill: "#ffffff", align: "left"});
		text2 = this.game.add.text(10*32, 0, "Enemies: ", {font: "15px Arial", fill: "#ffffff", align: "left"});		
	///////////////////////////////////////////////////////////////////////////////////////////////////
		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
	///////////////////////////////////////////////////////////////////////////////////////////////////
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		map = this.game.add.tilemap('map');
		map.addTilesetImage('greenBlock_32x32', 'greenBlock');
		map.addTilesetImage('red_ball_32x32', 'pointTile');
		layer = map.createLayer('Background');
		layer = map.createLayer('Walls');
		layer.resizeWorld();
		map.setCollision(1, true, 'Walls', true);
	///////////////////////////////////////////////////////////////////////////////////////////////////
		//this.game.physics.arcade.gravity.y = 300;//300;
	///////////////////////////////////////////////////////////////////////////////////////////////////
		index = this.game.rnd.integerInRange(1, LOCS)-1;
		player = new newPlayer(this.game, xlocs[index], ylocs[index]);
		
		baddies = this.game.add.group();
		baddies.enableBody = true;
		for(var i = 0; i < 25; i++)//25 enemies randomly on the map somewhere
		{
			baddies.add(newEnemy(this.game));
		}
	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////
		bulletgroup = this.game.add.group();
		bulletgroup.enableBody = true;
	///////////////////////////////////////////////////////////////////////////////////////////////////	
		timeMark = this.game.time.now;
		portMark = this.game.time.now;
    },

    update: function () {
		this.game.physics.arcade.overlap(bulletgroup, baddies, EnemyDie, null, this);
		this.game.physics.arcade.overlap(bulletgroup, layer, bulletKill, null, this);
		this.game.physics.arcade.collide(baddies, layer);//COLLIDE
		
		text1.text = "Ammunition: " + player.getShots();
		text2.text = "Enemies: " + baddies.countLiving();
	////Input Handlers/////////////////////////////////////////////////////////////////////////////////		
		if(!isShooting && (leftKey.isDown || aKey.isDown))
		{
			player.shoot(bulletgroup, -1, 0);
			isShooting = true;
		}
		else if(!isShooting && (rightKey.isDown || dKey.isDown))
		{
			player.shoot(bulletgroup, 1, 0);
			isShooting = true;
		}
		else if(!isShooting && (downKey.isDown || sKey.isDown))
		{
			player.shoot(bulletgroup, 0, 1);
			isShooting = true;
		}
		else if(!isShooting && (upKey.isDown || wKey.isDown))
		{
			player.shoot(bulletgroup, 0, -1);
			isShooting = true;
		}
		else{}//do nothing
		if(!leftKey.isDown && !rightKey.isDown && !downKey.isDown && !upKey.isDown && !aKey.isDown && !sKey.isDown && !dKey.isDown && !wKey.isDown)
		{
			isShooting = false;
		}
	////Time-set Handlers//////////////////////////////////////////////////////////////////////	
		if(this.game.time.now-timeMark > 4000)
		{
			dirFlag = true;
		}
		if(this.game.time.now-portMark > 1750)
		{
			teleport(this.game);
			portMark = this.game.time.now+this.game.rnd.integerInRange(-1000, 2500);
		}
		baddies.forEachAlive(EnemyUpdate, this, this);//does update with dirFlag either true or false
		if(dirFlag)
		{
			timeMark = this.game.time.now;
			dirFlag = false;
		}
		if(baddies.countLiving() <= 0 || player.getShots() <= 0)
		{
			//this.state.start('WinScreen');
			var score = 30+player.getShots()-baddies.countLiving();
			var text = this.game.add.text(704/4, 704/4, "GAME OVER\nScore: "+score, { font: "65px Arial", fill: "#ff0044", align: "center" });
		}
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');
    }

};

/*function fire(key)
{
	
};*/

function newEnemy(game)
{
	var xcoord, ycoord;
	
	xcoord = game.rnd.integerInRange(64, 608);
	ycoord = game.rnd.integerInRange(64, 608);
	
	var hume = new Enemy(game, xcoord, ycoord);
	game.physics.enable(hume, Phaser.Physics.ARCADE);
	hume.body.bounce.set(1);
	while(game.physics.arcade.overlap(hume, baddies))//game.physics.arcade.collide(hume, layer) || 
	{
		xcoord = game.rnd.integerInRange(64, 608);//removed collision checks for player and layer from above for now
		ycoord = game.rnd.integerInRange(64, 608);
		hume.kill();
		hume.reset(xcoord, ycoord);
	}
	EnemyDirectionSet(hume, game);
	
	return hume;//hume is a sprite
};

function EnemyDirectionSet(enemysprite, game)
{
	var angle = game.rnd.integerInRange(1, 360);
	enemysprite.body.velocity.x = ENEMYSPEED*Math.cos(angle);
	enemysprite.body.velocity.y = ENEMYSPEED*Math.sin(angle);
}

function Enemy(game, xcoord, ycoord)
{
	return game.add.sprite(xcoord, ycoord, 'blueBlock');
};

function EnemyUpdate(enemysprite, game)
{
	if(dirFlag)
	{
		EnemyDirectionSet(enemysprite, game);
	}
};

function teleport(game)
{
	index = game.rnd.integerInRange(1, LOCS)-1;
	player.sprite.x = xlocs[index];
	player.sprite.y = ylocs[index];
};

function EnemyDie(playerbullet, enemysprite)
{
	enemysprite.kill();
	playerbullet.kill();
};

function bulletKill(playerbullet, layer)
{
	playerbullet.kill();
};

function playerShoot()
{
	player.shoot(bulletgroup);
};