const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

// thick of each column, example 4 pixels per 1 width pixel
const WALL_STRIP_WIDTH = 30;
// the numbers of rays decrease based on WALL_STRIP_WIDTH
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
	constructor() {
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	hasWallAt(x, y) {
		// protection don't go outside the map
		if (x < 0 || x > WINDOW_WIDTH ||
			y < 0 || y > WINDOW_HEIGHT) {
			return true;
		}

		// Math.floor round the number to int
		var mapGridIndexX = Math.floor(x / TILE_SIZE);
		var mapGridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[mapGridIndexY][mapGridIndexX];
	}
	render() {
		for (var i = 0; i < MAP_NUM_ROWS; i++) {
			for (var j = 0; j < MAP_NUM_COLS; j++) {
				var tileX = j * TILE_SIZE;
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
			}
		}
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3; //player circle size
		this.turnDirection = 0; // -1 if left, +1 if right
		this.walkDirection = 0; // -1 if back, +1 if front
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 2.0;
		this.rotationSpeed = 2 * (Math.PI / 180);
	}
	// update player position based on turnDirection and walkDirection
	update() {
		// rotate more or minus pixels based on rotationSpeed
		// rotate to left or right base on turnDirection, adding or subtracting
		this.rotationAngle += this.turnDirection * this.rotationSpeed;

		// move more or minus pixels based on moveSpeed
		// move to front or back base on walkDirection, adding or subtracting
		var moveStep = this.walkDirection * this.moveSpeed;

		// newPlayerX and newPlayerY are the coordinates the player will go to
		// if there is no wall at that map position
		var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
		var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

		// only set new player position if it is not colliding with the map walls
		if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}
	render () {
		// noStroke();
		fill("red");
		circle(this.x, this.y, this.radius);
		stroke("red");
		line(
			this.x,
			this.y,
			this.x + Math.cos(this.rotationAngle) * 20,
			this.y + Math.sin(this.rotationAngle) * 20
		);
	}
}

class Ray {
	constructor (rayAngle) {
		this.rayAngle = rayAngle;
	}
	render() {
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			player.x,
			player.y,
			player.x + Math.cos(this.rayAngle) * 30,
			player.y + Math.sin(this.rayAngle) * 30
		);
	}
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	}
	else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	}
	else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	}
	else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	}
	else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	}
	else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	}
	else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function castAllRays() {
	var columnId = 0;

	// start first ray subtracting half of the FOV
	// value of first ray slice
	var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

	rays = [];

	// loop all columns casting the rays
	// for (var i = 0; i < NUM_RAYS; i++) {
	for (var i = 0; i < 1; i++) {
		var ray = new Ray(rayAngle);
		// ray.cast();...
		rays.push(ray);

		// increment ray by slice width
		// FOV_ANGLE / NUM_RAYS is the slice width
		rayAngle += FOV_ANGLE / NUM_RAYS;

		columnId++;
	}
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	update();

	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
