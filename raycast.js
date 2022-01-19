const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

// thick of each column, example 4 pixels per 1 width pixel
const WALL_STRIP_WIDTH = 1;
// the numbers of rays decrease based on WALL_STRIP_WIDTH
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

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
				rect(
					MINIMAP_SCALE_FACTOR * tileX,
					MINIMAP_SCALE_FACTOR * tileY,
					MINIMAP_SCALE_FACTOR * TILE_SIZE,
					MINIMAP_SCALE_FACTOR * TILE_SIZE
				);
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
		circle(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			MINIMAP_SCALE_FACTOR * this.radius
		);
		stroke("blue");
		line(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
			MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
		);
	}
}

class Ray {
	constructor (rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;

		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}
	cast(columnId) {
		var xintercept, yintercept;
		var xstep, ystep;

		///////////////////////////////////////////
		// HORIZONTAL RAY-GRID INTERSECTION CODE //
		//////////////////////////////////////////
		var foundHorzWallHit = false;
		var horzWallHitX = 0;
		var horzWallHitY = 0;

		// Find the y-coordinate of the closest horizontal grid intersection
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

		// Find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		// Calculate the increment xtep e and ystep
		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1;

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
		xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

		var nextHorzTouchX = xintercept;
		var nextHorzTouchY = yintercept;

		// removed because it was removing a pixel of the checkpoint
		// if (this.isRayFacingUp)
		// 	nextHorzTouchY--;

		// Increment xstep and ystep until we find a wall
		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH
			&& nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT)
		{
			if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
				foundHorzWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;

				break;
			}
			else {
				nextHorzTouchX += xstep;
				nextHorzTouchY += ystep;
			}
		}

		///////////////////////////////////////////
		// VERTICAL RAY-GRID INTERSECTION CODE  //
		//////////////////////////////////////////
		var foundVertWallHit = false;
		var vertWallHitX = 0;
		var vertWallHitY = 0;

		// Find the x-coordinate of the closest vertical grid intersection
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

		// Find the y-coordinate of the closest vertical grid intersection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		// Calculate the increment xtep e and ystep
		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1;

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
		ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

		var nextVertTouchX = xintercept;
		var nextVertTouchY = yintercept;

		// removed because it was removing a pixel of the checkpoint
		// if (this.isRayFacingLeft)
		// 	nextVertTouchX--;

		// Increment xstep and ystep until we find a wall
		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH
			&& nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT)
		{
			if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;

				break;
			}
			else {
				nextVertTouchX += xstep;
				nextVertTouchY += ystep;
			}
		}

		// Calculate both horizontal and vertical distances and chose
		// the smallest value
		var horzHitDistance = (foundHorzWallHit)
		? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
		: Number.MAX_VALUE;
		var vertHitDistance = (foundVertWallHit)
		? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
		: Number.MAX_VALUE;

		// only stores the smallest of the distances
		if (vertHitDistance < horzHitDistance) {
			this.wallHitX = vertWallHitX;
			this.wallHitY = vertWallHitY;
			this.distance = vertHitDistance;
			this.wasHitVertical = true;
		} else {
			this.wallHitX = horzWallHitX;
			this.wallHitY = horzWallHitY;
			this.distance = horzHitDistance;
			this.wasHitVertical = false;
		}
	}
	render() {
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			MINIMAP_SCALE_FACTOR * player.x,
			MINIMAP_SCALE_FACTOR * player.y,
			MINIMAP_SCALE_FACTOR * this.wallHitX,
			MINIMAP_SCALE_FACTOR * this.wallHitY,
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
	for (var i = 0; i < NUM_RAYS; i++) {
		var ray = new Ray(rayAngle);
		ray.cast(columnId);
		rays.push(ray);

		// increment ray by slice width
		// FOV_ANGLE / NUM_RAYS is the slice width
		rayAngle += FOV_ANGLE / NUM_RAYS;

		columnId++;
	}
}

function render3DProjectedWalls() {
	// loop every ray in the array of rays
	for (var i = 0; i < NUM_RAYS; i++) {
		var ray = rays[i];

		// get the perpendicular distance to the wall to fix fisheye distortion
		var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

		// calculate the distance to the projection plane
		var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

		// projected wall height
		var wallStripeHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

		// compute the transparency based on the wall distance
		var alpha = 70 / correctWallDistance;

		// render a rectangle with the calculated wall height
		fill("rgba(255, 255, 255, " + alpha + ")");
		noStroke();
		rect(
			// stripe width x, i is the ray index
			i * WALL_STRIP_WIDTH,
			// place the stripe in the middle of the screen
			(WINDOW_HEIGHT / 2) - (wallStripeHeight / 2),
			// stripe width x2, i is the ray index
			WALL_STRIP_WIDTH,
			// previously calculated height
			wallStripeHeight
		);
	}
}

function normalizeAngle(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0) {
		angle = (2 * Math.PI) + angle;
	}
	return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	clear("#212121");
	update();

	render3DProjectedWalls();

	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
