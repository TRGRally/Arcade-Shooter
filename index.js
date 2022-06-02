//running js and parsing canvas
var canvas = document.querySelector("canvas")
var c = canvas.getContext("2d")
canvas.shadowBlur = 0
canvas.width = innerWidth
canvas.height = innerHeight
c.imageSmoothingEnabled = true
var dt = 1
let mouse = { 	//mouse object for coords
	x: innerWidth / 2,
	y: innerHeight / 2
}

addEventListener("mousemove", function(event) { //update mouse object coords every time move event detected
	mouse.x = event.clientX
	mouse.y = event.clientY
})
addEventListener("resize", function() { //update render window size when the browser window size is changed
	canvas.width = innerWidth
	canvas.height = innerHeight
})

//Distance between two points equation
function Pythagoras(x1, y1, x2, y2) {

	let xDistance = x2 - x1

	let yDistance = y2 - y1

	return Math.sqrt(Math.pow(xDistance, 2 ) + Math.pow(yDistance, 2))

}
let regenlock = false
function HealthRegen(regenSpeed) {
	if (regenlock == false) {		//check if no other regen has been called
		regenlock = true			//ensure only one instance of the regen can be executed at once
		let movingThreshold = healthThreshold
		var regen = setInterval(() => { 	//"do this code every regenSpeed milliseconds"
			if (player.health < 100 && player.health >= movingThreshold - 1) { //if health hasnt decreased below threshold
				player.health = player.health + 1		//increase player health
				movingThreshold = movingThreshold + 1	//move threshold up by one
			} else {
				clearInterval(regen)
				regenlock = false						//unlock for next regen
			}

		}, regenSpeed)
	}
}

function SpawnWave(number, radius) { //determines where enmies spawn, what difficulty they are
	waveCount = waveCount + 1
	aliveEnemies = []
	deadEnemies = 0   
	//"cluster" is the centre of where the enemies will spawn 
	let cluster = {
		x: player.x,
		y: player.y
	}

	//try again if the random value is near the player
	while (Pythagoras(cluster.x, cluster.y, player.x, player.y) <= 800) {
		cluster.x = (Math.random() * innerWidth)
		cluster.y = (Math.random() * innerHeight)
		console.log("retry") //testing
	}

	console.log("cluster: " + cluster.x, cluster.y) //testing

	let enemySpawn = {
		x: 0,
		y: 0
	}

	for (let i = 0; i < number; i++) {
		//spawn enemy at random position in the cluster
		enemySpawn.x = 0
		enemySpawn.y = 0
		//if the enemy will be off screen, try again
		while ((enemySpawn.x >= innerWidth - 40) || (enemySpawn.x <= 40) || (enemySpawn.y >= innerHeight - 40) || (enemySpawn.y <= 40)) {
			enemySpawn.x = cluster.x + Math.floor(Math.random() * radius) * (Math.round(Math.random()) ? 1 : -1) 
			enemySpawn.y = cluster.y + Math.floor(Math.random() * radius) * (Math.round(Math.random()) ? 1 : -1) 
			console.log("retry")
		}
		aliveEnemies.push(new Enemy(enemySpawn.x, enemySpawn.y, 30, "rgb(220,60,35)", 100 + (waveCount * 3), 10 + (waveCount / 10), 5 + (waveCount / 3), 10 + (waveCount / 7), 2 + (waveCount / 6 )))
	}
	playSoundEffect("new_wave")
}

function playSoundEffect(filename){ //sound effect module, creates new sound object in document with filename passed in
	soundEffect = document.createElement("audio")
	soundEffect.src = "./sounds/" + filename + ".wav" //filename set as sound source
	soundEffect.volume = document.getElementById("soundEffectsVolume").value / 100
	soundEffect.play()
}

function determineRank() { //caluclates rank, displays on game over scoreboard
	if (scoreData != null) { //check if data from server exists before attempting...
		player.rank = 1
		scoreData.forEach((entry) => {
			if (player.score < entry.Score) {
				player.rank = player.rank + 1
			}
		})
		switch (player.rank) { //sets HTML depending on rank
			case 1:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br><span class='bold red'>1: YOU</span><br><br>2<br><br>3<br><br>4<br><br>5"
				break
			case 2:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br>1<br><br><span class='bold red'>2: YOU</span><br><br>3<br><br>4<br><br>5"
				break
			case 3:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br>1<br><br>2<br><br><span class='bold red'>3: YOU</span><br><br>4<br><br>5"
				break
			case 4:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br>1<br><br>2<br><br>3<br><br><span class='bold red'>4: YOU</span><br><br>5"
				break
			case 5:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br>1<br><br>2<br><br>3<br><br>4<br><br><span class='bold red'>5: YOU</span>"
				break
			default: //if not ranked 1-5, do:
				document.getElementById("gameOverScoreBoardRank").innerHTML = "<span class='bold'>RANK</span><br><br>1<br><br>2<br><br>3<br><br>4<br><br>5<br><br><span class='bold red'>" + player.rank + ": YOU</span>"
				document.getElementById("gameOverScoreBoardPlayer").innerHTML = document.getElementById("gameOverScoreBoardPlayer").innerHTML + "<br><br>" + player.name
				document.getElementById("gameOverScoreBoardScore").innerHTML = document.getElementById("gameOverScoreBoardScore").innerHTML + "<br><br>" + player.score
		}
	} else {
		console.log("score data not retrieved... are you connected to the internet?")
	}
}

function resolveCollision(o1, o2) { //collision handler, passes 2 objects in with expected xVelocity, yVelocity attributes
	var diffX = o2.x - o1.x
	var diffY = o2.y - o1.y
	var diffXVel = o1.xVelocity - o2.xVelocity
	var diffYVel = o1.yVelocity - o2.yVelocity
	if (diffXVel * diffX + diffYVel * diffY >= 0) { //checks if 2 objects are travelling in a direction that will collide - allows enemies to spawn over each other without glitching
		var theta = -Math.atan2(diffY, diffX) //angle of collision - note: "theta" here is technically neg. theta as it is the value to return from theta -> axis
		var o1NormXVel = o1.xVelocity * Math.cos(theta) - o1.yVelocity * Math.sin(theta) // rotation matrix modeled as individual equations for simplicity
		var o1NormYVel = o1.xVelocity * Math.sin(theta) + o1.yVelocity * Math.cos(theta) // takes 0bject 1, object 2 velocities and rotates them to the coordinate axis
		var o2NormXVel = o2.xVelocity * Math.cos(theta) - o2.yVelocity * Math.sin(theta) // allows the collision to be considered 1 dimensionally
		var o2NormYVel = o2.xVelocity * Math.sin(theta) + o2.yVelocity * Math.cos(theta) // reversed after collision calculation with negative theta
		//object 1 calc.
		var o1ResolvedXVel = o1NormXVel * (o1.mass - o2.mass) / (o1.mass + o2.mass) + o2NormXVel * 2 * o2.mass / (o1.mass + o2.mass) //conservation of kinetic energy, momentum
		var o1ResolvedYVel = o1NormYVel //1D ignores y vel
		//object 2 calc.
		var o2ResolvedXVel = o2NormXVel * (o2.mass - o1.mass) / (o1.mass + o2.mass) + o1NormXVel * 2 * o1.mass / (o1.mass + o2.mass) //conservation of kinetic energy, momentum
		var o2ResolvedYVel = o2NormYVel //1D ignores y vel
		//reverse rotation matrix
		var o1FinalXVel = o1ResolvedXVel * Math.cos(-theta) - o1ResolvedYVel * Math.sin(-theta)
		var o1FinalYVel = o1ResolvedYVel * Math.cos(-theta) + o1ResolvedXVel * Math.sin(-theta)
		var o2FinalXVel = o2ResolvedXVel * Math.cos(-theta) - o2ResolvedYVel * Math.sin(-theta)
		var o2FinalYVel = o2ResolvedYVel * Math.cos(-theta) + o2ResolvedXVel * Math.sin(-theta)
		//set values
		o1.xVelocity = o1FinalXVel
		o1.yVelocity = o1FinalYVel
		o2.xVelocity = o2FinalXVel
		o2.yVelocity = o2FinalYVel
	}
}

//defining classes
class Player { //player template
	constructor(x, y, radius, color, xVelocity, yVelocity, health, shotDamage) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xVelocity = xVelocity
		this.yVelocity = yVelocity
		this.health = health
		this.shotDamage = shotDamage
		this.shotSpeed = 10
		this.score = 0
		this.mass = 1.5
		this.name = "ANON"
		this.rank = 1
	}

	draw() { //create circle
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) //circle
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 3
		c.shadowColor = this.color
		c.lineWidth = 2
		c.stroke() //draw line of cirlce
		c.fill() //fill interior of circle
		c.closePath()
	}

	hurt() { //create hurt flash, start regen cycle
		this.color = "rgb(180,200,230)"
		playSoundEffect("player_hurt")
		healthThreshold = player.health
		
		setTimeout(() => {  this.color = "rgb(63,155,214)"; }, 50)
		console.log("player hurt")
		var delay = setTimeout(HealthRegen, 5000, 500)
	}

	movement() { //WASD
		if (W == true && this.yVelocity > -speedCap) {
			this.yVelocity = this.yVelocity - (movementAcceleration * dt)
		}
		if (A == true && this.xVelocity > -speedCap) {
			this.xVelocity = this.xVelocity - (movementAcceleration * dt)
		}
		if (S == true && this.yVelocity < speedCap) {
			this.yVelocity = this.yVelocity + (movementAcceleration * dt)
		}
		if (D == true && this.xVelocity < speedCap) {
			this.xVelocity = this.xVelocity + (movementAcceleration * dt)
		}
		//if velocity is negligible, set to 0 - saves computation
		if (this.xVelocity > -0.008 && this.xVelocity < 0.008){
			this.xVelocity = 0
		}
		if (this.yVelocity > -0.008 && this.yVelocity < 0.008){
			this.yVelocity = 0
		}
	}

	friction() { //slows object by a proportion of its current velocity
		if (this.yVelocity > 0) {
			this.yVelocity = this.yVelocity - (this.yVelocity / friction) * dt
		}
		if (this.xVelocity > 0) {
			this.xVelocity = this.xVelocity - (this.xVelocity / friction) * dt
		}
		if (this.yVelocity < 0) {
			this.yVelocity = this.yVelocity - (this.yVelocity / friction) * dt
		}
		if (this.xVelocity < 0) {
			this.xVelocity = this.xVelocity - (this.xVelocity / friction) * dt
		}
	}

	worldBorderCollision() { //screen edge collision - takes radius of cirlce into account
		if (this.y > (canvas.height - this.radius - 1)){
			this.yVelocity = 0 
			this.y = canvas.height - this.radius - 1
		}
		if (this.y < (1 + this.radius)){
			this.yVelocity = 0
			this.y = 1 + this.radius
		}
		if (this.x > (canvas.width - this.radius - 1)){
			this.xVelocity = 0
			this.x = canvas.width - this.radius - 1
		}
		if (this.x < (1 + this.radius)){
			this.xVelocity = 0
			this.x = 1 + this.radius
		}
	}
	update() { //calls draw and changes coords based on velocity - ease of use function
		this.draw()

		this.y = this.y + this.yVelocity * dt
		this.x = this.x + this.xVelocity * dt
	}
}

class Bullet { //bullet template
	constructor(x, y, radius, color, xVelocity, yVelocity, damage) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xVelocity = xVelocity
		this.yVelocity = yVelocity
		this.mass = 0.05
		this.damage = damage
	}

	draw() { //see player class for notes
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 4
		c.shadowColor = this.color
		c.lineWidth = 2
		c.stroke()
		c.fill()
	}

	update() { //see player class for notes
		this.draw()

		this.y = this.y + this.yVelocity * dt
		this.x = this.x + this.xVelocity * dt
	}
}

class Enemy { //enemy template
	constructor(x, y, radius, color, health, shotDamage, shotSpeed, contactDamage, speedCap) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xVelocity = 0
		this.yVelocity = 0
		this.health = health
		this.shotDamage = shotDamage
		this.shotSpeed = shotSpeed
		this.contactDamage = contactDamage
		this.speedCap = speedCap
		this.inaccuracy = 0.3
		this.value = this.shotDamage + this.contactDamage + this.speedCap
		this.mass = 0.5
	}

	draw() { //see player class for notes
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 3
		c.shadowColor = this.color
		c.lineWidth = 2
		c.stroke()
		c.fill()
		c.closePath()
	}

	hurt() { //damage flash
		var storedColor = this.color
		this.color = "rgb(255,165,149)"	
		playSoundEffect("enemy_hurt")
		setTimeout(() => {  this.color = storedColor; }, 50)
		
	}
	shoot() { //method to shoot a bullet, called randomly
		playSoundEffect("enemy_shoot")
		let spread = (Math.random() - 0.5) * this.inaccuracy //enemy aim innacuracy affects bullet direction
		let xvel = (player.x - this.x) / (Pythagoras(this.x, this.y, player.x, player.y)) * this.shotSpeed //calculate x dir of bullet - divide by dist to normalise
		let yvel = (player.y - this.y) / (Pythagoras(this.x, this.y, player.x, player.y)) * this.shotSpeed //calculate y dir of bullet - divide by dist to normalise
		enemyBullets.push(new Bullet(this.x, this.y, 5, "rgb(255,230,230)", xvel + spread, yvel + spread, this.shotDamage)) //push onto array
	}

	worldBorderCollision() { //see player class for notes
		if (this.y > (canvas.height - this.radius)){
			this.yVelocity = -this.yVelocity
		}

		if (this.y < this.radius){
			this.yVelocity = -this.yVelocity
		}

		if (this.x > (canvas.width - this.radius)){
			this.xVelocity = -this.xVelocity
		}

		if (this.x < this.radius){
			this.xVelocity = -this.xVelocity
		}
	}

	update() { //see player class for notes
		this.draw()
		this.worldBorderCollision
		this.y = this.y + this.yVelocity * dt
		this.x = this.x + this.xVelocity * dt
	}
}



function init() { //called on startup - make sure menu is correct
	gameState = "title screen"
	menuScreen = "titles"
}

let enemyCount = 0
let vignette
var bgColor = "rgba(26, 25, 23, 1)"
function DrawBackground(){ //creates the background gradient, draws it
	vignette = c.createRadialGradient(innerWidth / 2, innerHeight / 2, innerWidth / 1, innerWidth / 2, innerHeight / 2, innerWidth / 3) //vignette shape
	vignette.addColorStop(0, "rgba(0, 0, 0, 1") //vignette inner colour
	vignette.addColorStop(1, bgColor) //vignette outer colour
	c.fillStyle = vignette
	c.fillRect(0, 0, canvas.width, canvas.height) //fill
}


//init global scope vars, hoisted to beginning of file but put here as used in main loop
let musicVolume
let waveCount = 0
let gameState
let menuState
var bullets = []
var enemyBullets = []
var aliveEnemies = []
var deadEnemies = 0
var regen = false
let healthThreshold
c.rect(0, 0, canvas.width, canvas.height)
var enemyCollisionThisFrame = 0
var framecount = 0
var lastLoop = new Date()

//MAIN LOOP - RENDER WINDOW

function gameplayLoop() {
	framecount = framecount + 1
	var thisLoop = new Date()  //delta time since last frame
    var fps = Math.floor(1000 / (thisLoop - lastLoop))
    dt = (thisLoop - lastLoop) / 5 //set dt
    lastLoop = thisLoop;
	DrawBackground()
	requestAnimationFrame(gameplayLoop) //queue next frame

	if (gameState === "playing") { //GAMEPLAY STATE
		//player movement logic
		player.worldBorderCollision()
		player.friction()
		player.movement()
		//enemy bullet logic
		enemyBullets.forEach((bullet, listPosition) => {
			//detect collision
			if (Pythagoras(bullet.x, bullet.y, player.x, player.y) < bullet.radius + player.radius) {
				console.log("collision")
				player.health = player.health - bullet.damage
				player.hurt()
				resolveCollision(player, bullet)
				enemyBullets.splice(listPosition, 1)
			}
			//update position
			bullet.update()
		})

		

		//enemy logic
		aliveEnemies.forEach((enemy) => {
			if (enemy.health > 0) { //only execute if alive

				
			if (Math.round(Math.random() * (1000 - (40 * waveCount )) * dt) === 0) { //random shot calculation
				enemy.shoot()
			}


				aliveEnemies.forEach((enemy2) => { //check each enemy against each other enemy for collision
					if (Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y) != 0){ //enemy avoidance AI
						enemy.xVelocity = enemy.xVelocity + (enemy.x - enemy2.x) / Math.pow(Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y), 2.1)
						enemy.yVelocity = enemy.yVelocity + (enemy.y - enemy2.y) / Math.pow(Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y), 2.1)
						
					}

					if (Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y) <= enemy.radius + enemy2.radius && enemy !== enemy2){ //check for collision, only if not the same enemy
						
						resolveCollision(enemy, enemy2)
							
					} 
					
				})
				
				//target the player
				if (enemy.xVelocity < enemy.speedCap) {
					enemy.xVelocity = enemy.xVelocity - ((enemy.x - player.x) / Pythagoras(enemy.x, enemy.y, player.x, player.y) / 50) * dt
				}
			
				if (enemy.yVelocity < enemy.speedCap) {
					enemy.yVelocity = enemy.yVelocity - ((enemy.y - player.y) / Pythagoras(enemy.x, enemy.y, player.x, player.y) / 50) * dt
				}

				//friction
				if (enemy.yVelocity != 0) {
					enemy.yVelocity = enemy.yVelocity - (enemy.yVelocity / friction) * dt
				}
				
				if (enemy.xVelocity != 0) {
					enemy.xVelocity = enemy.xVelocity - (enemy.xVelocity / friction) * dt
				}
					
				
				//detect player-enemy collision
				if (Pythagoras(player.x, player.y, enemy.x, enemy.y) <= player.radius + enemy.radius) {
					player.health = player.health - enemy.contactDamage //lower health
					player.hurt()
					enemy.hurt()
					resolveCollision(player, enemy)
					enemy.health = 0 //kill enemy
					if (enemy.health <= 0) { //remove enmy from gameplay if dead, array wiped at end of each wave
						enemy.radius = 0
						enemy.x = -100
						enemy.y = -100
						enemy.xVelocity = 0
						enemy.yVelocity = 0
						deadEnemies = deadEnemies + 1
					}
				} 	
			}
			enemy.worldBorderCollision()
			enemy.update()		
		})

		bullets.forEach((bullet, listPosition) => { //player bullet logic
			if (bullet.radius != 0) {


				aliveEnemies.forEach((enemy) => { //check each bullet against each enemy
					if (enemy.radius != 0) {
						if (Pythagoras(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.radius + enemy.radius) { //collision check
							enemy.health = enemy.health - player.shotDamage //lower enemy health
							enemy.hurt()
							resolveCollision(enemy, bullet)
							enemy.update()
							if (enemy.health <= 0) { //if dead, remove
								player.score = Math.round(player.score + enemy.value)
								enemy.radius = 0
								enemy.x = -100
								enemy.y = -100
								enemy.xVelocity = 0
								enemy.yVelocity = 0
								deadEnemies = deadEnemies + 1
							}
							bullets.splice(listPosition, 1) //remove bullet
						} 
					}
				})
			}
			bullet.update()
		})

		if (aliveEnemies.length === deadEnemies) { //if all enemies dead (number in the list = number killed), spawn next wave in 2.5s
			deadEnemies = null
			enemyCount = enemyCount + 1 //increase enemy count for next wave
			setTimeout(SpawnWave, 2500, enemyCount, 100)
		}
		//HUD updates
		const healthBar = document.getElementById("healthBar")
		healthBar.value = player.health
		
		if (framecount % 10 == 0) {
			document.getElementById("fps").innerHTML = "FPS: " + fps
			document.getElementById("score").innerHTML = "SCORE " + player.score
			document.getElementById("waves").innerHTML = "WAVE " + waveCount
		}
		



		
		c.fillStyle = bgColor

		player.update()
		if (player.health <= 0){ //if player reaches 0HP, game over
			playSoundEffect("player_die")
			gameState = "game over"
		}
	//set relevant HTML elements to visible or non-visible
	document.getElementById("titleScreen").style.display = "none"
	document.getElementById("paused").style.display = "none"	
	document.getElementById("gameOverScreen").style.display = "none"
	document.getElementById("HUD").style.display = "grid"

	} else if (gameState === "title screen") { //title screen game state - contains options, high scores, title screen
		if (menuState === "titles") { //title screen
			//set relevant HTML elements to visible or non-visible
			document.getElementById("titleScreen").style.display = "grid"
			document.getElementById("optionsScreen").style.display = "none"
			document.getElementById("scoresScreen").style.display = "none"
			document.getElementById("profileScreen").style.display = "none"

		} else if (menuState === "scores") { //high scores screen
			//set relevant HTML elements to visible or non-visible
			document.getElementById("scoresScreen").style.display = "grid"
			document.getElementById("optionsScreen").style.display = "none"
			document.getElementById("titleScreen").style.display = "none"
			document.getElementById("profileScreen").style.display = "none"

		} else if (menuState === "options") { //options menu
			//set relevant HTML elements to visible or non-visible
			document.getElementById("optionsScreen").style.display = "grid"
			document.getElementById("scoresScreen").style.display = "none"
			document.getElementById("titleScreen").style.display = "none"
			document.getElementById("profileScreen").style.display = "none"
			//options slider logic
			document.getElementById("soundEffectsVolumeText").innerHTML = "<span class='bold'>SFX Volume: </span>" + document.getElementById("soundEffectsVolume").value + "%"
			document.getElementById("musicVolumeText").innerHTML = "<span class='bold'>Music Volume: </span>" + document.getElementById("musicVolume").value + "%"
			musicValue = document.getElementById("musicVolume").value 
		} else if (menuState === "profile") { //profile screen
			//set relevant HTML elements to visible or non-visible
			document.getElementById("profileScreen").style.display = "grid"
			document.getElementById("scoresScreen").style.display = "none"
			document.getElementById("optionsScreen").style.display = "none"
			document.getElementById("titleScreen").style.display = "none"

		}
		//set relevant HTML elements to visible or non-visible
		document.getElementById("paused").style.display = "none"
		document.getElementById("gameOverScreen").style.display = "none"
		document.getElementById("HUD").style.display = "none"

	} else if (gameState === "game over") { //game over screen
		//set relevant HTML elements to visible or non-visible
		document.getElementById("gameOverScreen").style.display = "grid"
		document.getElementById("HUD").style.display = "none"
		document.getElementById("paused").style.display = "none"
		document.getElementById("titleScreen").style.display = "none"
		//check if score has been saved yet, if not, save it.
		if (savedScore == false) {
			savedScore = true
			submitScore()
			setTimeout(() => {				//wait a short time between each network related function to allow bad response time
				getScores()
				setTimeout(() => {
						determineRank()
				}, 200)
			}, 200)
			
			
		}
	} else if (gameState === "paused") { //pause menu
		//set relevant HTML elements to visible or non-visible
		document.getElementById("gameOverScreen").style.display = "none"
		document.getElementById("HUD").style.display = "none"
		document.getElementById("paused").style.display = "grid"
		document.getElementById("titleScreen").style.display = "none"
	}
 }

//variables for controls and listeners, hoisted but left here for relevance
var friction = 100
var bulletSpeed = 10
var movementAcceleration = 0.06
var speedCap = 10
var key = 0
var W = false
var A = false
var S = false
var D = false
let soundEffect
let playHover
let savedScore = false
let player

//controls
addEventListener("mousedown", (event) => { //mouse click down event listener -> shoot bullet if currently ingame
	if (event.button == 0){ //only shoot on left click
		if (gameState === "playing") { //check for playing game
			playSoundEffect("player_shoot")
			xvel = (mouse.x - player.x) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.shotSpeed //calculate x dir, divide by distance to normalise
			yvel = (mouse.y - player.y) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.shotSpeed //calculate x dir, divide by distance to normalise
			var spread = Math.random() < 0.5 ? -0.2 : 0.2 //add spread
			bullets.push(new Bullet(player.x, player.y, 10, "rgb(255,250,230)", xvel + spread, yvel + spread, player.shotDamage)) //push new bullet to array
		}
	}
})



addEventListener("mouseup", (event2) => { //placeholder mouse up for future
	//up
})
//WASD movement
addEventListener("keydown", (keypress) => { //key down event listener to set WASD keys to true on press

	key = keypress.keyCode
	switch (key) {
    	case 87: 
    		W = true
    		break
    	case 65:
    		A = true
    		break
    	case 83:
    		S = true
    		break
    	case 68:
    		D = true
    		break
		case 27: //checks for esc key, opens pause menu if in game, closes pause menu if already paused
			if (gameState === "playing"){
				gameState = "paused"
				playSoundEffect("pause")
			} else if (gameState === "paused"){
				gameState = "playing"
				playSoundEffect("unpause")
			}
	}

})

addEventListener("keyup", (keyup) => { //key up event listener to set WASD keys to false on release
	key = keyup.keyCode
	switch (key) {
	case 87: 
		W = false
		break
	case 65:
		A = false
		break
	case 83:
		S = false
		break
	case 68:
		D = false
		break
	}
})

//UI PARSING BELOW

//PLAY BUTTON
const playButton = document.getElementById("playButton")
playButton.addEventListener("click", () => {
	player = new Player(innerWidth / 2, innerHeight / 1.8, 42, "rgb(63,155,214)", 0, -1, 100, 100, 50) //makes new player
	gameState = "playing" //changes game state to playing
	playSoundEffect("play_button")
	if (document.getElementById("name").value != ""){ //checks if the name box is empty, if yes, sets default name. if no, copies name to player
		player.name = document.getElementById("name").value
	} else {
		player.name = "ANON"
	}
	
})

function submitScore(){ //AJAX REQUEST: creates server POST request to store the player's score and name into the database
	savedScore = true
	let scoreDate = Date.now()
	var params = "name=" + player.name + "&" + "score=" + player.score + "&" + "timestamp=" + scoreDate //format params for the POST request
	console.log(params)
	var request = new XMLHttpRequest() //create new request
	request.open("POST", "submitScore.php", true) //set to POST request, call php file
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded") //set request format

	request.onload = function(){
		if(this.status == 200){ //200 = success code
			console.log(this.responseText)
		} else if (this.status == 404){ //404 = no file code
			console.log("Error 404, file not found.")
		}
	}

	request.onerror = function(){ //error handle
		console.log("There was an error with the request, are you connected to the internet?")
	}

	//send request to the server
	request.send(params)
}

function getScores(){ //AJAX REQUEST: creates server GET request to retrieve the stored scores information form the database
	var request = new XMLHttpRequest() //create new request
	request.open("GET", "getScores.php", true) //set GET request
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded") //set request type

	request.onload = function(){
		if(this.status == 200){ //200 = success code
			scoreData = JSON.parse(this.responseText) //parse the JSON response and save to object
			console.log(scoreData)
			if (gameState === "title screen") { //if on title screen, show on scoreboard

				document.getElementById("scoreBoardPlayer").innerHTML = "<span class='bold'>PLAYER</span>"
				document.getElementById("scoreBoardScore").innerHTML = "<span class='bold'>SCORE</span>"

				for (let entry = 0; entry < 5; entry++) { //go through top 5 scores, set HTML iteratively
				
					document.getElementById("scoreBoardPlayer").innerHTML = document.getElementById("scoreBoardPlayer").innerHTML + "<br><br>" + scoreData[entry].Player
					document.getElementById("scoreBoardScore").innerHTML = document.getElementById("scoreBoardScore").innerHTML + "<br><br>" + scoreData[entry].Score

				}
			} else if (gameState === "game over") { //if on game over, show on game over screen

				document.getElementById("gameOverScoreBoardPlayer").innerHTML = "<span class='bold'>PLAYER</span>"
				document.getElementById("gameOverScoreBoardScore").innerHTML = "<span class='bold'>SCORE</span>"

				for (let entry = 0; entry < 5; entry++) { //go through top 5 scores, set HTML iteratively
				
					document.getElementById("gameOverScoreBoardPlayer").innerHTML = document.getElementById("gameOverScoreBoardPlayer").innerHTML + "<br><br>" + scoreData[entry].Player
					document.getElementById("gameOverScoreBoardScore").innerHTML = document.getElementById("gameOverScoreBoardScore").innerHTML + "<br><br>" + scoreData[entry].Score

				}
			}
		} else if (this.status == 404){ //404 = no file code
			console.log("Error 404, file not found.")
		}
	}

	request.onerror = function(){ //error handle
		console.log("There was an error with the request, are you connected to the internet?")
	}

	//send request to the server
	request.send()
}

function resetValues() { //prepare new game by resetting values
	savedScore = false
	bullets = []
	enemyBullets = []
	aliveEnemies = []
	deadEnemies = 0
	waveCount = 0
	enemyCount = 0
}
//play button hover mouse listeners: set glow value higher if hovering
playButton.addEventListener("mouseover", () => {
	playHover = true
	playButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	playButton.style.border = "solid whitesmoke 2px";
})
playButton.addEventListener("mouseout", () => {
	playHover = false
	playButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	playButton.style.border = "solid grey 2px";
})


//OPTIONS BUTTON//
const optionsButton = document.getElementById("optionsButton")
optionsButton.addEventListener("click", () => {
	menuState = "options"
	playSoundEffect("button")
})
//set glow value higher if hovering, set back when un-hover
optionsButton.addEventListener("mouseover", () => {
	optionsButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	optionsButton.style.border = "solid whitesmoke 2px";
})
optionsButton.addEventListener("mouseout", () => {
	optionsButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	optionsButton.style.border = "solid grey 2px";
})


//OPTIONS BACK BUTTON
const optionsBackButton = document.getElementById("optionsBackButton")
optionsBackButton.addEventListener("click", () => {
	menuState = "titles"
	playSoundEffect("button")
})
//set glow value higher if hovering, set back when un-hover
optionsBackButton.addEventListener("mouseover", () => {
	optionsBackButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	optionsBackButton.style.border = "solid whitesmoke 2px";
})
optionsBackButton.addEventListener("mouseout", () => {
	optionsBackButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	optionsBackButton.style.border = "solid grey 2px";
})

//PROFILE BUTTON//
const profileButton = document.getElementById("profileButton")
profileButton.addEventListener("click", () => {
	menuState = "profile"
	playSoundEffect("button")
})
//set glow value higher if hovering, set back when un-hover
profileButton.addEventListener("mouseover", () => {
	profileButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	profileButton.style.border = "solid whitesmoke 2px";
})
profileButton.addEventListener("mouseout", () => {
	profileButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	profileButton.style.border = "solid grey 2px";
})

//SCORES BUTTON//
const scoresButton = document.getElementById("scoresButton")
scoresButton.addEventListener("click", () => {
	getScores()
	menuState = "scores"
	playSoundEffect("button")
})
//set glow value higher if hovering, set back when un-hover
scoresButton.addEventListener("mouseover", () => {
	scoresButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	scoresButton.style.border = "solid whitesmoke 2px";
})
scoresButton.addEventListener("mouseout", () => {
	scoresButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	scoresButton.style.border = "solid grey 2px";
})


//SCORES BACK BUTTON
const scoresBackButton = document.getElementById("scoresBackButton")
scoresBackButton.addEventListener("click", () => {
	menuState = "titles"
	playSoundEffect("button")
})
//set glow value higher if hovering, set back when un-hover
scoresBackButton.addEventListener("mouseover", () => {
	scoresBackButton.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	scoresBackButton.style.border = "solid whitesmoke 2px";
})
scoresBackButton.addEventListener("mouseout", () => {
	scoresBackButton.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	scoresBackButton.style.border = "solid grey 2px";
})

//GAME OVER RETURN BUTTON
const returnToMenu = document.getElementById("returnToMenu")
returnToMenu.addEventListener("click", () => {
	gameState = "title screen"
	menuState = "titles"
	playSoundEffect("button")
	resetValues()
})
//set glow value higher if hovering, set back when un-hover
returnToMenu.addEventListener("mouseover", () => {
	returnToMenu.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 1)";
	returnToMenu.style.border = "solid whitesmoke 2px";
})
returnToMenu.addEventListener("mouseout", () => {
	returnToMenu.style.textShadow = "0px 0px 8px rgba(255, 255, 255, 0.5)";
	returnToMenu.style.border = "solid grey 2px";
})
//startup
init()
resetValues()
gameplayLoop()




