//GLOBAL SCOPE DECLARATIONS
let scoreData = null
let client = null
let musicVolume
let waveCount = 0
let gameState
menuState = "titles"
var bullets = []
var enemyBullets = []
var aliveEnemies = []
var deadEnemies = 0
var regen = false
let healthThreshold
var enemyCollisionThisFrame = 0
let goingToProfle = false

//running js and parsing canvas
connection()
var canvas = document.querySelector("canvas")
var c = canvas.getContext("2d")
canvas.shadowBlur = 0
canvas.width = innerWidth
canvas.height = innerHeight
c.imageSmoothingEnabled = true
var dt = 1
let mouse = { 	//mouse object for coords
	x: innerWidth / 2,
	y: innerHeight / 2,
	clicked: false
}

addEventListener("mousemove", function(event) { //update mouse object coords every time move event detected
	mouse.x = event.clientX
	mouse.y = event.clientY
})
addEventListener("resize", function() { //update render window size when the browser window size is changed
	canvas.width = innerWidth
	canvas.height = innerHeight
})

function Pythagoras(x1, y1, x2, y2) {
	let xDistance = x2 - x1
	let yDistance = y2 - y1
	return Math.sqrt(Math.pow(xDistance, 2 ) + Math.pow(yDistance, 2))
}
2
function playSoundEffect(filename){ //sound effect module, creates new sound object in document with filename passed in
	let soundEffect = document.createElement("audio")
	soundEffect.src = "./sounds/" + filename + ".wav" //filename set as sound source
	soundEffect.volume = document.getElementById("soundEffectsVolume").value / 100
	soundEffect.play()
}

class Client {
	constructor() {
		this.auth = false
		this.username = "Default"
		this.highscore = 0
		this.highwave = 0
		this.gamesplayed = 0
		this.shotsfired = 0
		this.starttime = new Date()
		this.alivetime = 0
	}

	login(username, password) { 
		var _this = this
		console.log(username, password)
		var params = "username=" + username + "&" + "password=" + password //format params for the POST request
		console.log(params)
		var request = new XMLHttpRequest()
		request.open("POST", "../php/login.php", true)
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		request.onload = function(){
			if(this.status == 200 && JSON.parse(this.responseText) == true){ //200 = success code
				console.log("status 200...")
				console.log("server responded true")
				_this.auth = true
				console.log(_this.auth)
				console.log("authenticated")
				_this.username = username
				console.log(_this.username)
				console.log("username set")
				menuState = "titles"
				document.getElementById("loginRegisterButton").style.display = "none"
				_this.getStats()
				document.getElementById("loggedInAs").innerHTML = `Playing as ${_this.username}`
				if (goingToProfile === true) {
					_this.getStats()
					menuState = "profile"
					goingToProfile = false
				}
				return true
			} else {
				console.log("incorrect details")
				let status = document.getElementById("status")
				status.classList = "red"
				status.innerHTML = "Incorrect username or password"
				return false
			}
		}
		request.onerror = function(){ //error handle
			console.log("There was an error with the request, are you connected to the internet?")
		}
		request.send(params)
	}

	getStats() {
		var _this = this
		var request = new XMLHttpRequest() //create new request
		var params = "username=" + this.username
		request.open("POST", "../php/getStats.php", true) //set GET request
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded") //set request type
		request.onload = function(){
			if(this.status == 200){ //200 = success code
				let statData = JSON.parse(this.responseText) //parse the JSON response and save to object
				console.log(statData)
				_this.gamesplayed = parseInt(statData[0].GamesPlayed)
				_this.highscore = parseInt(statData[0].HighScore)
				_this.highwave = parseInt(statData[0].HighWave)
				_this.shotsfired = parseInt(statData[0].ShotsFired)
			} else if (this.status == 404){ //404 = no file code
				console.log("Error 404, file not found.")
			}
		}
		request.onerror = function(){ //error handle
			console.log("There was an error with the request, are you connected to the internet?")
		}
		request.send()
	}

	submitStats() {
		var _this = this
		console.log(this.ganesplayed)
		this.gamesplayed = this.gamesplayed + 1
		console.log(this.gamesplayed)
		this.shotsfired = this.shotsfired + player.shotsfired
		if (player.score > _this.highscore) {
			_this.highscore = player.score
		}
		if (waveCount > _this.highwave) {
			_this.highwave = waveCount
		}
		var request = new XMLHttpRequest()
		var params = "highscore=" + this.highscore + "&" + "highwave=" + this.highwave + "&" + "gamesplayed=" + this.gamesplayed + "&" + "shotsfired=" + this.shotsfired + "&" + "username=" + this.username
		request.open("POST", "../php/submitStats.php", true)
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		request.onload = function(){
			if (this.status == 200){
				console.log("updated stats")
			} else if (this.status == 400){
				console.log("Error 404, file not found.")
			}
		}
		request.onerror = function(){ //error handle
			console.log("There was an error with the request, are you connected to the internet?")
		}
		request.send(params)
	}

	update() {
		let currenttime = new Date()
		this.alivetime = currenttime - this.starttime
	}
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
	constructor(x, y, radius, color, xVelocity, yVelocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xVelocity = xVelocity
		this.yVelocity = yVelocity
		this.health = 100
		this.shotDamage = 50
		this.bulletSpeed = 8
		this.shotSpeed = 3
		this.shotInterval = 1000 / this.shotSpeed
		this.lastShot = 0
		this.shotsfired = 0
		this.score = 0
		this.mass = 1.5
		this.name = "Guest"
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
			this.y = canvas.height - this.radius
		}

		if (this.y < this.radius){
			this.yVelocity = -this.yVelocity
			this.y = this.radius
		}

		if (this.x > (canvas.width - this.radius)){
			this.xVelocity = -this.xVelocity
			this.x = canvas.width - this.radius
		}

		if (this.x < this.radius){
			this.xVelocity = -this.xVelocity
			this.x = this.radius
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
	menuState = "titles"
	client = new Client()
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

c.rect(0, 0, canvas.width, canvas.height)
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
		


		let current = new Date()
		if (mouse.clicked === true && current - player.lastShot >= player.shotInterval) {
			player.lastShot = new Date()
			playSoundEffect("player_shoot")
			let xvel = (mouse.x - player.x) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.bulletSpeed //calculate x dir, divide by distance to normalise
			let yvel = (mouse.y - player.y) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.bulletSpeed //calculate x dir, divide by distance to normalise
			var spread = Math.random() < 0.5 ? -0.2 : 0.2 //add spread
			player.shotsfired = player.shotsfired + 1
			console.log(player.shotsfired)
			bullets.push(new Bullet(player.x, player.y, 10, "rgb(255,250,230)", xvel + spread, yvel + spread, player.shotDamage)) //push new bullet to array
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
			document.getElementById("profileScreen").style.display = "none"
			document.getElementById("loginRegisterScreen").style.display = "none"

		} else if (menuState === "options") { //options menu
			//set relevant HTML elements to visible or non-visible
			document.getElementById("optionsScreen").style.display = "grid"
			document.getElementById("titleScreen").style.display = "none"
			document.getElementById("profileScreen").style.display = "none"
			document.getElementById("loginRegisterScreen").style.display = "none"
			//options slider logic
			document.getElementById("soundEffectsVolumeText").innerHTML = "<span class='bold'>SFX Volume: </span>" + document.getElementById("soundEffectsVolume").value + "%"
			document.getElementById("musicVolumeText").innerHTML = "<span class='bold'>Music Volume: </span>" + document.getElementById("musicVolume").value + "%"
			musicValue = document.getElementById("musicVolume").value 
		} else if (menuState === "profile") { //profile screen
			//set relevant HTML elements to visible or non-visible
			document.getElementById("profileName").innerHTML = client.username
			document.getElementById("profileHighScoreNumber").innerHTML = client.highscore
			document.getElementById("profileGamesNumber").innerHTML = client.gamesplayed
			document.getElementById("profileHighWaveNumber").innerHTML = client.highwave
			document.getElementById("profileShotsNumber").innerHTML = client.shotsfired
			document.getElementById("profileScreen").style.display = "grid"
			document.getElementById("optionsScreen").style.display = "none"
			document.getElementById("titleScreen").style.display = "none"
			document.getElementById("loginRegisterScreen").style.display = "none"

		} else if (menuState === "loginRegister") { //login/register screen
			//set relevant HTML elements to visible or non-visible
			document.getElementById("loginRegisterScreen").style.display = "grid"
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
			client.submitStats()
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
	if (event.button == 0 && gameState === "playing"){ //only shoot on left click
		mouse.clicked = true
	}
})

addEventListener("mouseup", (event2) => { //placeholder mouse up for future
	mouse.clicked = false
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

			if (gameState === "title screen" && menuState !== "titles") {
				menuState = "titles"
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
	player = new Player(innerWidth / 2, innerHeight / 1.8, 42, "rgb(63,155,214)", 0, -1, 100) //makes new player
	gameState = "playing" //changes game state to playing
	playSoundEffect("play_button")
	if (client.auth == true){ //checks if the name box is empty, if yes, sets default name. if no, copies name to player
		player.name = client.username
		client.getStats()
	} else {
		player.name = "Guest"
	}
	
})

function submitScore(){ //AJAX REQUEST: creates server POST request to store the player's score and name into the database
	savedScore = true
	let scoreDate = Date.now()
	var params = "name=" + player.name + "&" + "score=" + player.score + "&" + "timestamp=" + scoreDate //format params for the POST request
	var request = new XMLHttpRequest() //create new request
	request.open("POST", "../php/submitScore.php", true) //set to POST request, call php file
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
	request.open("GET", "../php/getScores.php", true) //set GET request
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded") //set request type

	request.onload = function(){
		if(this.status == 200){ //200 = success code
			scoreData = JSON.parse(this.responseText) //parse the JSON response and save to object
			if (gameState === "title screen" && menuState === "titles") { //if on title screen, show on leaderboard
				let table = document.getElementById("scoreTable")
				table.innerHTML = ""
				for (let entry = 0; entry < scoreData.length; entry++) {
					let rank = entry + 1
					let row = table.insertRow(entry)
					let rankCell = row.insertCell(0)
					let playerCell = row.insertCell(1)
					let scoreCell = row.insertCell(2)
					rankCell.innerHTML = `${rank}.`
					playerCell.innerHTML = scoreData[entry].Player
					scoreCell.innerHTML = scoreData[entry].Score

				}
				document.getElementById("leaderboardContent").innerHTML += "</table>"

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



//OPTIONS BUTTON//
const optionsButton = document.getElementById("optionsButton")
optionsButton.addEventListener("click", () => {
	menuState = "options"
	playSoundEffect("button")
})




//OPTIONS BACK BUTTON
const optionsBackButton = document.getElementById("optionsBackButton")
optionsBackButton.addEventListener("click", () => {
	menuState = "titles"
	playSoundEffect("button")
})



//PROFILE BUTTON//
const profileButton = document.getElementById("profileButton")
profileButton.addEventListener("click", () => {
	
	if (client.auth == false) {
		menuState = "loginRegister"
		goingToProfile = true
	} else {
		client.getStats()
		console.log("retrieved stats")
		menuState = "profile"
	}
	playSoundEffect("button")
})


//DISCORD BUTTON//
const discordButton = document.getElementById("discordButton")
discordButton.addEventListener("click", () => {
	window.open("https://discord.gg/k5Grv8F")
	playSoundEffect("button")
})


//LOGIN OR REGISTER MENU BUTTON//
const loginRegisterButton = document.getElementById("loginRegisterButton")
loginRegisterButton.addEventListener("click", () => {
	if (client.auth == true) {
		return
	}
	menuState = "loginRegister"
	playSoundEffect("button")
})

//LOGGED IN AS TEXT//
const loggedInAs = document.getElementById("loggedInAs")

//LOGIN BUTTON//
const loginButton = document.getElementById("loginButton")
loginButton.addEventListener("click", () => {
	let username = document.getElementById("loginUsername").value
	let password = document.getElementById("loginPassword").value
	console.log(username, password)
	client.login(username, password)
	console.log("login button pressed")
	playSoundEffect("button")
})

//register BUTTON//
const registerButton = document.getElementById("registerButton")
registerButton.addEventListener("click", () => {
	let username = document.getElementById("loginUsername").value
	let password = document.getElementById("loginPassword").value
	register(username, password)
	playSoundEffect("button")
})



//REFRESH SCORES BUTTON (MAIN MENU)//
const refreshScoresButton = document.getElementById("refreshScores")
refreshScoresButton.addEventListener("click", () => {
	playSoundEffect("button")
	getScores()

	table = document.getElementById("scoreTable")
	table.classList.remove('flash') // reset animation
	void table.offsetWidth // trigger reflow
	table.classList.add('flash') // start animation

	refreshScoresButton.classList.remove('refreshClick') // reset animation
	void refreshScoresButton.offsetWidth // trigger reflow
	refreshScoresButton.classList.add('refreshClick') // start animation
})

//ABOUT BUTTON//
const aboutButton = document.getElementById("aboutButton")
aboutButton.addEventListener("click", () => {
	playSoundEffect("button")
	open("http://www.peterholl.com/about")
})

//MORE GAMES BUTTON//
const moreGamesButton = document.getElementById("moreGamesButton")
moreGamesButton.addEventListener("click", () => {
	playSoundEffect("button")
	open("http://www.peterholl.com/gearhop")
})

//PROFILE BACK BUTTON

const profileBackButton = document.getElementById("profileBackButton")
profileBackButton.addEventListener("click", () => {
	playSoundEffect("button")
	menuState = "titles"
})

//GAME OVER RETURN BUTTON
const returnToMenu = document.getElementById("returnToMenu")
returnToMenu.addEventListener("click", () => {
	gameState = "title screen"
	menuState = "titles"
	playSoundEffect("button")
	resetValues()
})


function connection(){ 
	var request = new XMLHttpRequest() //create new request
	request.open("GET", "../php/connection.php", true) //set GET request
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded") //set request type

	request.onload = function(){
		if(this.status == 200){ //200 = success code
			let response = this.responseText
			console.log(response)
			secure = 1
		} else if (this.status == 404){ //404 = no file code
			console.log("Running in insecure mode")
		}
	}

	request.onerror = function(){ //error handle
		console.log("There was an error establishing a connection to the server.")
	}

	//send request to the server
	request.send()
}

let secure = 0


//update
function sendAnalytics() {
	return null
}


function register(username, password) {
	var params = "username=" + username + "&" + "password=" + password //format params for the POST request
	var request = new XMLHttpRequest()
	request.open("POST", "../php/register.php", true)
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	
	request.onload = function(){
		if(this.status == 200){ //200 = success code
			const registered = JSON.parse(this.responseText)
			if (registered === true) {
				login(username, password)
			} else {
				console.log("account already exists")
				let status = document.getElementById("status")
				status.classList = "red"
				status.innerHTML = "An account with that username already exists..."
			}
		} else if (this.status == 404){ //404 = no file code
			console.log("Error 404, file not found.")
		}
	}

	request.onerror = function(){ //error handle
		console.log("There was an error with the request, are you connected to the internet?")
	}

	request.send(params)
}




//startup
init()
resetValues()
getScores()
gameplayLoop()

function totalConnections() {
	var request = new XMLHttpRequest() //create new request
	request.open("GET", "../php/totalConnections.php", true) //set GET request
	request.onload = function(){
		if(this.status == 200){ //200 = success code
			var connections = this.responseText
			console.log(connections)
		} else if (this.status == 404){ //404 = no file code
			console.log("error fetching total connections")
		}
	}
	request.onerror = function(){ //error handle
		console.log("There was an error establishing a connection to the server.")
	}
	request.send()
	return JSON.stringify(this.responseText)
}

window.onbeforeunload = function(){
	if(gameState !== "playing") {
		sendAnalytics()
		return null
	}
	if (savedScore == false) {
		savedScore = true
		submitScore()
	}
	sendAnalytics()
	return "Your score will be lost!"
 }


