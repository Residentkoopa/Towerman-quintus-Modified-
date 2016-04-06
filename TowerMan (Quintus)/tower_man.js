// 1. Wait for the onload event
window.addEventListener("load",function() {

	// Global variables 
	var worldMap;
	var player;

	// 2. Set up a basic Quintus object
	//    with the necessary modules and controls
	//    to make things easy, we're going to fix this game at 640x480
	var Q = window.Q = Quintus({ development: true })
		  .include("Sprites, Scenes, Input, 2D")
		  .setup({ width: 1000, height: 1000 ,scaleToFit: true});

	// 3. Add in the default keyboard controls
	//    along with joypad controls for touch
	Q.input.keyboardControls();
	Q.input.joypadControls();
  
	// 7. Remove gravity
	Q.gravityY = 0;
	Q.gravityX = 0;
	
	// 8. Sprite Constants
	
	var SPRITE_PLAYER = 1;
	var SPRITE_TILES = 2;
	var SPRITE_ENEMY = 4;
	var SPRITE_DOT = 8;
	
	// Components 
	
	// Player Controls
	Q.component("towerManControls", {
	  // default properties to add onto our entity
	  defaults: { speed: 100, direction: '' },

	  // called when the component is added to
	  // an entity
	  added: function() {
		var p = this.entity.p;

		// add in our default properties
		Q._defaults(p,this.defaults);

		// every time our entity steps
		// call our step method
		this.entity.on("step",this,"step");
	  },

	  step: function(dt) {
		// grab the entity's properties
		// for easy reference
		var p = this.entity.p;

		// rotate the player
		// based on our velocity
		if(p.vx > 0) {
		  p.angle = 90;
		} else if(p.vx < 0) {
		  p.angle = 270;
		} else if(p.vy > 0) {
		  p.angle = 180;
		} else if(p.vy < 0) {
		  p.angle = 0;
		}

		// grab a direction from the input
		p.direction = Q.inputs['left']  ? 'left' :
					  Q.inputs['right'] ? 'right' :
					  Q.inputs['up']    ? 'up' :
					  Q.inputs['down']  ? 'down' : p.direction;

		// based on our direction, try to add velocity
		// in that direction
		switch(p.direction) {
		  case "left": p.vx = -p.speed;  break;
		  case "right":p.vx = p.speed;  break;
		  case "up":   p.vy = -p.speed;  break;
		  case "down": p.vy = p.speed;  break;
		}
	  }
	});
	
	// Enemy "AI"
	
	Q.component("enemyControls", {
	  defaults: { speed: 100, direction: 'left', switchPercent: 10 , hardTurnPercent:10},

	  added: function() {
		var p = this.entity.p;

		Q._defaults(p,this.defaults);

		this.entity.on("step",this,"step");
		this.entity.on('hit',this,"changeDirection");
	  },

	  step: function(dt) {
		var p = this.entity.p;

		// Randomly try to switch directions
		if(Math.random() < p.switchPercent / 100) {
		  this.tryDirection();
		}

		// Add velocity in the direction we are currently heading.
		switch(p.direction) {
		  case "left": p.vx = -p.speed; break;
		  case "right":p.vx = p.speed;  break;
		  case "up":   p.vy = -p.speed;break;
		  case "down": p.vy = p.speed;break;
		}
	  },

	  // Try a random direction 90 degrees away from the 
	  // current direction of movement
	  tryDirection: function() {
		var p = this.entity.p; 
		var from = p.direction;
		if(p.vy != 0 && p.vx == 0) {
		  p.direction = Math.random() < 0.5 ? 'left' : 'right';
		} else if(p.vx != 0 && p.vy == 0) {
		  p.direction = Math.random() < 0.5 ? 'up' : 'down';
		}
	  },

	  // Called every collision, if we're stuck,
	  // try moving in a direction 90 degrees away from the normal
	  changeDirection: function(collision) {
		var p = this.entity.p;
		if(p.vx == 0 && p.vy == 0) {
		  if(collision.normalY) {
			p.direction = Math.random() < 0.5 ? 'left' : 'right';
		  } else if(collision.normalX) {
			p.direction = Math.random() < 0.5 ? 'up' : 'down';
		  }
		}
	  }
	});
	
	
	// Sprites
	// 4. Add in a basic sprite to get started
	Q.Sprite.extend("Player", {
	  init: function(p) {

		this._super(p,{
		  sheet:"player",
		  // Add in a type and collisionMask
		  type: SPRITE_PLAYER, 
		  collisionMask: SPRITE_TILES | SPRITE_ENEMY | SPRITE_DOT
		});

		// Add in the towerManControls component in addition
		// to the 2d component
		this.add("2d, towerManControls");
	  }
	});
	
	// 9. Adding Dots and towers to the Stage
	
	Q.Sprite.extend("Dot", {
	  init: function(p) {
		this._super(p,{
		  sheet: 'dot',
		  type: SPRITE_DOT,
		  // Set sensor to true so that it gets notified when it's
		  // hit, but doesn't trigger collisions itself that cause
		  // the player to stop or change direction
		  sensor: true
		});

		this.on("sensor");
		this.on("inserted");
	  },

	  // When a dot is hit..
	  sensor: function() {
		// Destroy it and keep track of how many dots are left
		this.destroy();
		this.stage.dotCount--;
		// If there are no more dots left, just restart the game
		if(this.stage.dotCount == 0) {
		  Q.stageScene("level1");
		}
	  },

	  // When a dot is inserted, use it's parent (the stage)
	  // to keep track of the total number of dots on the stage
	  inserted: function() {
		this.stage.dotCount = this.stage.dotCount || 0;
		this.stage.dotCount++;
	  }
	});


	// Tower is just a dot with a different sheet - use the same
	// sensor and counting functionality
	Q.Dot.extend("Tower", {
	  init: function(p) {
		this._super(Q._defaults(p,{
		  sheet: 'tower'
		}));
	  }
	});
	
	// Return a x and y location from a row and column
	// in our tile map
	Q.tilePos = function(col,row) {
	  return { x: col*32 + 16, y: row*32 + 16 };
	}

	// 10. Adding the map
	Q.TileLayer.extend("TowerManMap",{
	  init: function(p) {
		this._super({
		  type: SPRITE_TILES,
		  dataAsset: 'level.json',
		  sheet:     'tiles'
		});

	  },

	  setup: function() {
		// Clone the top level arriw
		var tiles = this.p.tiles = mazeJson(16,24);//this.p.tiles.concat();
		worldMap=tiles;
		this.p.rows = tiles.length;
		this.p.cols = tiles[0].length;
		var s='';
		for(aux=0;aux<tiles.length;aux++)
			s+=''+tiles[aux]+'\n';
		console.log(s);
		var size = this.p.tileW;
		for(var y=0;y<tiles.length;y++) {
		  var row = tiles[y] = tiles[y].concat();
		  for(var x =0;x<row.length;x++) {
			var tile = row[x];

			// Replace 0's with dots and 2's with Towers
			if(tile == 0 || tile == 2) {
			  var className = tile == 0 ? 'Dot' : 'Tower'
			  this.stage.insert(new Q[className](Q.tilePos(x,y)));
			  row[x] = 0;
			}
		  }
		}
	  }
	});
	
	Q.Sprite.extend("Enemy", {
	  init: function(p) {

		this._super(p,{
		  sheet:"enemy",
		  type: SPRITE_ENEMY,
		  collisionMask: SPRITE_PLAYER | SPRITE_TILES
		});

		this.add("2d,enemyControls");
		this.on("hit.sprite",this,"hit");
	  },

	  hit: function(col) {
		if(col.obj.isA("Player")) {
		  Q.stageScene("level1");
		}
	  }
	});
	

	// 5. Put together a minimal level
	Q.scene("level1",function(stage) {
		
		var map = stage.collisionLayer(new Q.TowerManMap());
		map.setup();
		var midx = Math.floor(worldMap.length/2);
		var midy = Math.floor(worldMap[0].length/2);
		
		if(worldMap[midx][midy]!= 1)
			player = stage.insert(new Q.Player(Q.tilePos(midy,midx)));
		else 
			if(worldMap[midx][midy+1]!= 1)
				player = stage.insert(new Q.Player(Q.tilePos(midy+1,midx)));
			else
				if(worldMap[midx][midy-1]!= 1)
					player = stage.insert(new Q.Player(Q.tilePos(midy-1,midx)));
				else
					if(worldMap[midx+1][midy]!= 1)
						player = stage.insert(new Q.Player(Q.tilePos(midy,midx+1)));
					else
						player = stage.insert(new Q.Player(Q.tilePos(midy,midx-1)));
						
		// Add in some enemies with the lines below
		stage.insert(new Q.Enemy(Q.tilePos(1,1)));
		stage.insert(new Q.Enemy(Q.tilePos(worldMap[0].length-2,1)));
		stage.insert(new Q.Enemy(Q.tilePos(1,worldMap.length-2)));
		stage.insert(new Q.Enemy(Q.tilePos(worldMap[0].length-2,worldMap.length-2)));
		
		
	});

	// 6. Load and start the level
	Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
		Q.sheet("tiles","tiles.png", { tileW: 32, tileH: 32 });
		Q.compileSheets("sprites.png","sprites.json");
		Q.stageScene("level1");
	});

});