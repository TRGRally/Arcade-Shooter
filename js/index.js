//GLOBAL SCOPE DECLARATIONS
let scoreData = null
let client = null
let musicVolume
let waveCount = 0
let gameState
let menuState = "titles"
var bullets = []
var enemies = []
let coins = []
let particles = []
var deadEnemies = 0
let goingToGameOver = false
var regen = false
let healthThreshold
var enemyCollisionThisFrame = 0
let goingToProfle = false
let waveTrigger = false
let goingToProfile = false
let animStart
let upgrades
let upgradeBought = false
let upgradesGenerated = false
var bgColor = "rgba(26, 25, 23, 1)"
//running js and parsing canvas
connection()
var canvas = document.getElementById("canvas")
var c = canvas.getContext("2d", {desynchronized:true, alpha:false})
var profileCanvas = document.getElementById("profileCharacter")
var pc = profileCanvas.getContext("2d")
profileCanvas.width = 500
profileCanvas.height = 500
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
    if (typeof x1 === 'number' && typeof y1 === 'number' && typeof x2 === 'number' && typeof y2 === 'number') {
        let xDistance = x2 - x1
        let yDistance = y2 - y1
        return Math.sqrt(Math.pow(xDistance, 2 ) + Math.pow(yDistance, 2))
    }
    else {
        return False
    }
}
//function to generate a random number between two numbers
function Random(lower, upper) {
	if (isNaN(lower) || isNaN(upper)) {
		throw new Error('Both arguments must be numbers')
	}
	return Math.floor(Math.random() * (upper - lower + 1) + lower)
}

function playSoundEffect(filename, volume){ //sound effect module, creates new sound object in document with filename passed in
	let soundEffect = document.createElement("audio")
	soundEffect.src = "./sounds/" + filename + ".wav" //filename set as sound source
	soundEffect.volume = (document.getElementById("soundEffectsVolume").value / 100) * volume //volume set as sound effect volume * volume passed in
	soundEffect.play()
}


function DrawBackground(){
	let vignette = c.createRadialGradient(innerWidth / 2, innerHeight / 2, innerWidth / 1, innerWidth / 2, innerHeight / 2, innerWidth / 3)
	vignette.addColorStop(0, "rgba(0, 0, 0, 1")
	vignette.addColorStop(1, bgColor)
	c.fillStyle = vignette
	c.fillRect(0, 0, canvas.width, canvas.height)
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
				console.log('Increased Health')
			} else {
				clearInterval(regen)
				regenlock = false						//unlock for next regen
				console.log('Regen Complete')
			}

		}, regenSpeed)
	} else {
		console.log('Regen already in progress')
	}
}

function SpawnWave(number, radius) { //determines where enmies spawn, what difficulty they are
	waveCount = waveCount + 1
	enemies = [] 
	//"cluster" is the centre of where the enemies will spawn 
	let cluster = {
		x: player.x,
		y: player.y
	}

	//try again if the random value is near the player
	while (Pythagoras(cluster.x, cluster.y, player.x, player.y) <= 800) {
		cluster.x = (Math.random() * innerWidth)
		cluster.y = (Math.random() * innerHeight)
		//console.log("retry") //testing
	}

	//console.log("cluster: " + cluster.x, cluster.y) //testing

	let enemySpawn = {
		x: 0,
		y: 0
	}

	for (let i = 0;   i < number; i++) {
		//spawn enemy at random position in the cluster
		enemySpawn.x = 0
		enemySpawn.y = 0
		//if the enemy will be off screen, try again
		while ((enemySpawn.x >= innerWidth - 40) || (enemySpawn.x <= 40) || (enemySpawn.y >= innerHeight - 40) || (enemySpawn.y <= 40)) {
			enemySpawn.x = cluster.x + Math.floor(Math.random() * radius) * (Math.round(Math.random()) ? 1 : -1) 
			enemySpawn.y = cluster.y + Math.floor(Math.random() * radius) * (Math.round(Math.random()) ? 1 : -1) 
			//console.log("retry")
		}
		if (i % 2 == 0) {
			enemies.push(new Enemy(enemySpawn.x, enemySpawn.y, 30, "rgb(220,60,35)", 100 + (waveCount * 3), 10 + (waveCount / 10), 5 + (waveCount / 3), 10 + (waveCount / 7), 2 + (waveCount / 6 )))
		} else {
			enemies.push(new MeleeEnemy(enemySpawn.x, enemySpawn.y, 22, "rgb(204, 120, 4)", 30, 30, 5))
		}
		
		
	}
	playSoundEffect("new_wave", 1)
	waveTrigger = false
}

//this function is used to determine a player's rank on the game over scoreboard
//it is called when the game is over, and the player's rank is displayed in orange, blinking text

function determineRank() {
	//caluclates rank, displays on game over scoreboard
	if (scoreData != null) { //check if data from server exists before attempting...
		player.rank = 0
		scoreData.forEach((entry) => {
			if (player.score < entry.Score) {
				player.rank = player.rank + 1
			}
		})
		let table = document.getElementById("gameOverScoreTable")
		let rows = table.querySelectorAll("tr")
		let current = rows.item(player.rank)
		current.classList.add("orange")
		current.classList.add("blink")
		current.classList.add("scrollpad")
		
		setTimeout(
			() => current.scrollIntoView({block: "start", behavior: "smooth"})
		, 900)
	} else {
		console.log("score data not retrieved... are you connected to the internet?")
	}
}


function selectUpgrades() {
	return null
}


function resolveCollision(o1, o2) { //collision handler, passes 2 objects in with expected xvel, yvel attributes
	var diffX = o2.x - o1.x
	var diffY = o2.y - o1.y
	var diffXVel = o1.xvel - o2.xvel
	var diffYVel = o1.yvel - o2.yvel
	if (diffXVel * diffX + diffYVel * diffY >= 0) { //checks if 2 objects are travelling in a direction that will collide - allows enemies to spawn over each other without glitching
		var theta = -Math.atan2(diffY, diffX) //angle of collision - note: "theta" here is technically neg. theta as it is the value to return from theta -> axis
		var o1NormXVel = o1.xvel * Math.cos(theta) - o1.yvel * Math.sin(theta) // rotation matrix modeled as individual equations for simplicity
		var o1NormYVel = o1.xvel * Math.sin(theta) + o1.yvel * Math.cos(theta) // takes 0bject 1, object 2 velocities and rotates them to the coordinate axis
		var o2NormXVel = o2.xvel * Math.cos(theta) - o2.yvel * Math.sin(theta) // allows the collision to be considered 1 dimensionally
		var o2NormYVel = o2.xvel * Math.sin(theta) + o2.yvel * Math.cos(theta) // reversed after collision calculation with negative theta
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
		o1.xvel = o1FinalXVel
		o1.yvel = o1FinalYVel
		o2.xvel = o2FinalXVel
		o2.yvel = o2FinalYVel
	}
}


















class Client {
	constructor() {
		this.auth = false
		this.username = "Guest"
		this.highscore = 0
		this.highwave = 0
		this.gamesplayed = 0
		this.shotsfired = 0
		this.starttime = new Date()
		this.alivetime = 0
		this.upgrade1 = null
		this.upgrade2 = null
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
		request.send(params)
	}

	submitStats() {
		var _this = this
		this.gamesplayed = this.gamesplayed + 1
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


//Wrapper for the javascript setTimeout function which allows for easy pausing and resuming of the timer
class Timer {
	constructor(callback, delay) {
		this.callback = callback
		this.delay = delay
		this.timerId = null
		this.start = null
		this.remaining = delay
		this.paused = false
		this.resume = false
		this.running = false
		//many more attributes here than necessary but it makes checking the state easier
	}

	pause() {
		if (this.running === true) {
			this.paused = true
			this.running = false
			window.clearTimeout(this.timerId)
			this.remaining -= new Date() - this.start
		}
	}

	resume() {
		if (this.paused === true) {
			this.resume = true
			this.paused = false
			this.start = new Date()
			window.clearTimeout(this.timerId)
			this.timerId = window.setTimeout(this.callback, this.remaining)
		}
	}

	start() {
		if (this.running === false) {
			this.running = true
			this.start = new Date()
			this.timerId = window.setTimeout(this.callback, this.remaining)
		}
	}

	stop() {
		this.running = false
		this.paused = false
		this.resume = false
		window.clearTimeout(this.timerId)
		this.remaining = this.delay
	}
}





//defining classes
class Player { //player template
	constructor(x, y, radius, color, xvel, yvel) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xvel = xvel
		this.yvel = yvel
		this.health = 100
		this.maxHealth = 100
		this.shotDamage = 50
		this.bulletSpeed = 8
		this.shotRate = 3
		this.acceleration = 0.06
		this.speedCap = 10
		this.shotInterval = 1000 / this.shotRate
		this.lastShot = 0
		this.shotsfired = 0
		this.score = 0
		this.mass = 1.5
		this.name = "Guest"
		this.rank = 1
		this.coins = 0
		this.gun = new Gun(c, this, this.radius + 35, 30, "rgb(255,255,255)")
		this.dead = false
		this.upgrades = []
		this.weapon = "default_gun"
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
		playSoundEffect("player_hurt", 1)
		healthThreshold = player.health
		
		setTimeout(() => {  this.color = "rgb(63,155,214)"; }, 50)
		var delay = setTimeout(HealthRegen, 5000, 500)
	}

	//explode on death
	die() {
		playSoundEffect("player_die", 1)
		this.dead = true
		for (var i = 0; i < 40; i++) {
			particles.push(new Particle(this.x, this.y, 10, this.color, Random(-10,10) / 5, Random(-10,10) / 5, 1000))
		}
	}

	applyUpgrade(upgrade) { //takes upgrade object and applies it to player, providing they have enough coins
		if (upgrade == "heal") {
			this.health = this.maxHealth
			console.log("healed", this.health, this.maxHealth)
			return true
		}
		if (this.coins < upgrade.cost) {
			return false
		}
		if (upgrade.type === "stat") {
			this.maxHealth = (this.maxhealth + upgrade.maxHealth) || this.maxHealth
			this.shotDamage = (this.shotDamage + upgrade.shotDamage) || this.shotDamage
			this.bulletSpeed = (this.bulletSpeed + upgrade.bulletSpeed) || this.bulletSpeed
			this.shotRate = (this.shotRate + upgrade.shotRate) || this.shotRate
			this.acceleration = (this.acceleration + upgrade.acceleration) || this.acceleration
			this.speedCap = (this.speedCap + upgrade.speedCap) || this.speedCap
			this.shotInterval = 1000 / this.shotRate
		}
		if (upgrade.type === "heal") {
			this.health = this.maxHealth
		}
		if (upgrade.type === "weapon") {
			this.weapon = upgrade.weapon
		}
		this.coins = this.coins - upgrade.cost
		this.upgrades.push(upgrade)
		console.table(this.maxHealth, this.shotDamage, this.bulletSpeed, this.shotRate, this.acceleration, this.speedCap, this.coins, this.weapon)
		return true
	}

	movement() { //WASD
		if (W == true && this.yvel > -this.speedCap) {
			this.yvel = this.yvel - (this.acceleration * dt)
		}
		if (A == true && this.xvel > -this.speedCap) {
			this.xvel = this.xvel - (this.acceleration * dt)
		}
		if (S == true && this.yvel < this.speedCap) {
			this.yvel = this.yvel + (this.acceleration * dt)
		}
		if (D == true && this.xvel < this.speedCap) {
			this.xvel = this.xvel + (this.acceleration * dt)
		}
		//if velocity is negligible, set to 0 - saves computation
		if (this.xvel > -0.008 && this.xvel < 0.008 && this.xvel != 0){
			this.xvel = 0
		}
		if (this.yvel > -0.008 && this.yvel < 0.008 && this.xvel != 0){
			this.yvel = 0
		}
	}

	friction() { //slows object by a proportion of its current velocity
		if (this.yvel > 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel > 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
		if (this.yvel < 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel < 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
	}

	worldBorderCollision() { //screen edge collision - takes radius of cirlce into account
		if (this.y > (canvas.height - this.radius - 1)){
			this.yvel = -this.yvel 
			this.y = canvas.height - this.radius - 1
		}
		if (this.y < (1 + this.radius)){
			this.yvel = -this.yvel 
			this.y = 1 + this.radius
		}
		if (this.x > (canvas.width - this.radius - 1)){
			this.xvel = -this.xvel 
			this.x = canvas.width - this.radius - 1
		}
		if (this.x < (1 + this.radius)){
			this.xvel = -this.xvel 
			this.x = 1 + this.radius
		}
	}
	update() { //calls draw and changes coords based on velocity - ease of use function
		this.gun.update()
		this.draw()
		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
	}
}

class Particle {
	constructor(x, y, radius, color, xvel, yvel, length) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xvel = xvel
		this.yvel = yvel
		this.length = length //ms to live
		this.birth = Date.now()
		this.time = 0
		setTimeout(() => { 
			this.radius = 0
			particles.splice(particles.indexOf(this), 1)
		}, this.length)
	}

	friction() { //slows object by a proportion of its current velocity
		if (this.yvel > 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel > 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
		if (this.yvel < 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel < 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
	}

	draw() { //create circle
		c.globalAlpha = 1 - this.time
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) //circle
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.lineWidth = 2
		c.stroke() //draw line of cirlce
		c.fill() //fill interior of circle
		c.closePath()
		c.globalAlpha = 1
	}
	update() { //calls draw and changes coords based on velocity - ease of use function
		this.time = (Date.now() - this.birth) / this.length
		this.draw()
		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
	}
}



//create a grey rectangle which rotates around the player pointing in the direction of the mouse to represent the gun
class Gun {
	constructor(c, parent, width, height, color) {
		this.c = c
		this.parent = parent
		this.x = parent.x
		this.y = parent.y
		this.width = width
		this.height = height
		this.color = color
		this.angle = 1
	}

	recoil() {
		this.width = this.width - 4
		setTimeout(() => {  this.width = this.width + 4; }, 40)
	}

	draw() {
		c = this.c
		c.save()
		c.translate(this.x, this.y)
		c.rotate(this.angle)
		c.beginPath()
		c.rect(this.width / this.parent.radius, this.height / this.parent.radius - this.height / 2, this.width, this.height)
		c.fillStyle = this.color
		c.shadowColor = "white"
		c.shadowBlur = this.parent.radius / 4
		c.fill()
		c.closePath()
		c.restore()
	}

	update() {
		this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x)
		this.x = this.parent.x
		this.y = this.parent.y
		this.draw()
	}
}

//create class for the character showcase in the profile screen so players can see what their character will look like and edit its color
class CharacterShowcase {
	constructor(radius, color) {
		this.x = profileCanvas.width / 2
		this.y = profileCanvas.height / 2
		this.radius = radius
		this.color = color
		this.xvel = 0
		this.yvel = 0
		this.gun = new Gun(pc, this, this.radius + 80, 90, "rgb(255,255,255)")
		this.gun.angle = 2 * Math.PI
	}



	draw() { //create circle
		pc.beginPath()
		pc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) //circle
		pc.strokeStyle = this.color
		pc.fillStyle = this.color
		pc.shadowBlur = this.radius / 3
		pc.shadowColor = this.color
		pc.lineWidth = 2
		pc.stroke() //draw line of cirlce
		pc.fill() //fill interior of circle
		pc.closePath()
	}

	update() { //calls draw and changes coords based on velocity - ease of use function

		
		this.color = document.getElementById("color1Picker").value
		this.gun.color = document.getElementById("color2Picker").value
		this.gun.draw()
		this.draw()
		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
		
	}

}




class Bullet { //bullet template
	constructor(team, x, y, radius, color, xvel, yvel, damage) {
		this.team = team //team 1 is player, team 0 is enemy
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xvel = xvel
		this.yvel = yvel
		this.mass = 0.05
		this.damage = damage
		this.bounce = 0
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

		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
	}
}

class Coin {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.radius = 12
		this.color = "rgb(245, 207, 17)"
		this.xvel = Random(-100, 100) / 50
		this.yvel = Random(-100, 100) / 50
		this.pullRadius = 200
		this.pullSpeed = 5
		this.birth = Date.now()
		this.time = Date.now() - this.birth
		this.flash()
	}

	friction() { //slows object by a proportion of its current velocity
		if (this.yvel > 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel > 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
		if (this.yvel < 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		if (this.xvel < 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}
	}

	worldBorderCollision() { //see player class for notes
		if (this.y > (canvas.height - this.radius)){
			this.yvel = -this.yvel
			this.y = canvas.height - this.radius
		}

		if (this.y < this.radius){
			this.yvel = -this.yvel
			this.y = this.radius
		}

		if (this.x > (canvas.width - this.radius)){
			this.xvel = -this.xvel
			this.x = canvas.width - this.radius
		}

		if (this.x < this.radius){
			this.xvel = -this.xvel
			this.x = this.radius
		}
	}

	pull() {
		let dist = Pythagoras(this.x, this.y, player.x ,player.y)
		if (dist < this.pullRadius) {
			if (dist <= player.radius) {
				this.collect()
				
				
			}
			let xdiff = player.x - this.x
			let ydiff = player.y - this.y
			this.xvel += xdiff / (dist * this.pullSpeed) * dt
			this.yvel += ydiff / (dist * this.pullSpeed) * dt
		}
	}

	collect() {
		player.coins += 1
		coins.splice(coins.indexOf(this), 1)
		playSoundEffect("coin_collect", 1)
	}

	flash() {
		setTimeout(() => {
			this.color = "rgb(247, 240, 185)"
		}, 300)
		setInterval(() => {

			this.color = "rgb(245, 207, 17)"
		}, 600)
		setTimeout(() => {
			setInterval(() => {
				this.color = "rgb(247, 240, 185)"
			}, 600)
		}, 300)
	}
	draw() { //see player class for notes

		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 4
		c.shadowColor = this.color
		c.lineWidth = 2
		c.fill()
	}

	update() { //see player class for notes
		this.time = Date.now() - this.birth
		this.draw()
		this.friction()
		this.worldBorderCollision()
		this.pull()
		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
		
	}
}

class Enemy { //enemy template
	constructor(x, y, radius, color, health, shotDamage, shotSpeed, contactDamage, speedCap) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xvel = 0
		this.yvel = 0
		this.health = health
		this.shotDamage = shotDamage
		this.shotSpeed = shotSpeed
		this.contactDamage = contactDamage
		this.speedCap = speedCap
		this.inaccuracy = 0.3
		this.value = this.shotDamage + this.contactDamage + this.speedCap
		this.mass = 0.5
		this.birth = Date.now()
		this.time = Date.now() - this.birth
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
		playSoundEffect("enemy_hurt", 1)
		setTimeout(() => {  this.color = storedColor; }, 50)
		for (var i = 0; i < 10; i++) {
			particles.push(new Particle(this.x, this.y, 5, storedColor, Random(-7,7) / 10, Random(-7,7) / 10, 200))
		}
		
	}

	die(score) {
		//playSoundEffect("enemy_die")
		enemies.splice(enemies.indexOf(this), 1)
		for (var i = 0; i < 10; i++) {
			particles.push(new Particle(this.x, this.y, 10, this.color, Random(-10,10) / 10, Random(-10,10) / 10, 1000))
		}
		if (score === true) {
			player.score += Math.floor(this.value)
			coins.push(new Coin(this.x, this.y))
		}
	}
	shoot() { //method to shoot a bullet, called randomly
		playSoundEffect("enemy_shoot", 1)
		let spread = (Math.random() - 0.5) * this.inaccuracy //enemy aim innacuracy affects bullet direction
		let xvel = (player.x - this.x) / (Pythagoras(this.x, this.y, player.x, player.y)) * this.shotSpeed //calculate x dir of bullet - divide by dist to normalise
		let yvel = (player.y - this.y) / (Pythagoras(this.x, this.y, player.x, player.y)) * this.shotSpeed //calculate y dir of bullet - divide by dist to normalise
		bullets.push(new Bullet(0, this.x, this.y, 5, "rgb(255,230,230)", xvel + spread, yvel + spread, this.shotDamage)) //push onto array
	}

	worldBorderCollision() { //see player class for notes
		if (this.y > (canvas.height - this.radius)){
			this.yvel = -this.yvel
			this.y = canvas.height - this.radius
		}

		if (this.y < this.radius){
			this.yvel = -this.yvel
			this.y = this.radius
		}

		if (this.x > (canvas.width - this.radius)){
			this.xvel = -this.xvel
			this.x = canvas.width - this.radius
		}

		if (this.x < this.radius){
			this.xvel = -this.xvel
			this.x = this.radius
		}
	}

	ai() {
		//target the player
		if (Math.abs(this.xvel) < this.speedCap) {
			this.xvel = this.xvel - ((this.x - player.x) / Pythagoras(this.x, this.y, player.x, player.y) / 50) * dt
		}
	
		if (Math.abs(this.yvel) < this.speedCap) {
			this.yvel = this.yvel - ((this.y - player.y) / Pythagoras(this.x, this.y, player.x, player.y) / 50) * dt
		}

		//friction
		if (this.yvel != 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		
		if (this.xvel != 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}

		//shoot
		if (Math.round(Math.random() * (1000 - (40 * waveCount )) * dt) === 0) { //random shot calculation
			this.shoot()
		}

		//detect player-this collision
		if (Pythagoras(player.x, player.y, this.x, this.y) <= player.radius + this.radius) {
			player.health = player.health - this.contactDamage //lower health
			player.hurt()
			this.hurt()
			resolveCollision(player, this)
			this.health = 0 //kill this
			if (this.health <= 0) { //remove enmy from gameplay if dead, array wiped at end of each wave
				this.radius = 0
				this.xvel = 0
				this.yvel = 0
				this.die(false)
				deadEnemies = deadEnemies + 1
			}
		} 	
	}


	update() { //see player class for notes
		this.time = Date.now() - this.birth
		this.draw()
		this.ai()
		this.worldBorderCollision()
		this.y = this.y + this.yvel * dt
		this.x = this.x + this.xvel * dt
	}
}

//create a melee enemy class which inherits from enemy class
class MeleeEnemy extends Enemy {
	constructor(x, y, radius, color, health, contactDamage, speedCap) {
		super(x, y, radius, color, health, 0, 0, contactDamage, speedCap)
		this.xvel = 0
		this.yvel = 0
		this.mass = 0.5
		this.value = this.contactDamage + this.speedCap
	}


	ai() {
		//target the player
		if (Math.abs(this.xvel) < this.speedCap) {
			this.xvel = this.xvel - ((this.x - player.x) / Pythagoras(this.x, this.y, player.x, player.y) / 30) * dt
		}
	
		if (Math.abs(this.yvel) < this.speedCap) {
			this.yvel = this.yvel - ((this.y - player.y) / Pythagoras(this.x, this.y, player.x, player.y) / 30) * dt
		}
		//friction
		if (this.yvel != 0) {
			this.yvel = this.yvel - (this.yvel / friction) * dt
		}
		
		if (this.xvel != 0) {
			this.xvel = this.xvel - (this.xvel / friction) * dt
		}

		//detect player-this collision
		if (Pythagoras(player.x, player.y, this.x, this.y) <= player.radius + this.radius) {
			player.health = player.health - this.contactDamage //lower health
			player.hurt()
			this.hurt()
			resolveCollision(player, this)
			this.health = 0 //kill this
			this.radius = 0
			this.xvel = 0
			this.yvel = 0
			this.die(false)
			deadEnemies = deadEnemies + 1
		}
	} 	


}




















//
//
//  MAIN LOOP - RENDER WINDOW
//
//

let enemyCount = 0
c.rect(0, 0, canvas.width, canvas.height)
var framecount = 0
var lastLoop = new Date()
function gameplayLoop() {
	framecount = framecount + 1
	var thisLoop = new Date()  //delta time since last frame
    var fps = Math.floor(1000 / (thisLoop - lastLoop))
    dt = (thisLoop - lastLoop) / 5 //set dt
    lastLoop = thisLoop;
	DrawBackground()
	requestAnimationFrame(gameplayLoop) //queue next frame

	if (gameState === "playing") { //GAMEPLAY STATE
		if (client.auth === true) {
			client.update()
			client.shotsfired = player.shotsfired
			console.table(client)
		}
		//player movement logic
		player.worldBorderCollision()
		player.friction()
		player.movement()
		//enemy bullet logic
		bullets.forEach((bullet, listPosition) => {
			if (bullet.team === 0) { //enemy bullet
				if (Pythagoras(bullet.x, bullet.y, player.x, player.y) < bullet.radius + player.radius) {
					player.health = player.health - bullet.damage
					player.hurt()
					resolveCollision(player, bullet)
					bullets.splice(listPosition, 1)
				}
			}
			if (bullet.team === 1) { //player bullet
				if (bullet.radius != 0) {
					enemies.forEach((enemy) => { //check each bullet against each enemy
						if (enemy.radius != 0) {
							if (Pythagoras(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.radius + enemy.radius) { //collision check
								enemy.health = enemy.health - player.shotDamage //lower enemy health
								enemy.hurt()
								resolveCollision(enemy, bullet)
								enemy.update()
								if (enemy.health <= 0) { //if dead, remove
									enemy.radius = 0
									enemy.xvel = 0
									enemy.yvel = 0
									enemy.die(true)
									deadEnemies = deadEnemies + 1
								}
								bullets.splice(listPosition, 1) //remove bullet
							} 
						}
					})
					if (bullet.bounce == 0) {
						if (bullet.y > (canvas.height - bullet.radius - 1)){
							for(let i = 0; i < 3; i++){
								particles.push(new Particle(bullet.x, bullet.y, 8, "rgba(255, 0, 0)", Random(-10,10) / 10, Random(-10,10) / 10, 500))
							}
							bullet.yvel = -bullet.yvel 
							bullet.y = canvas.height - bullet.radius - 1
							bullet.bounce = 1
							bullet.color = "rgba(255, 0, 0, 1)"
							bullet.team = 0
						}
						if (bullet.y < (1 + bullet.radius)){
							for(let i = 0; i < 3; i++){
								particles.push(new Particle(bullet.x, bullet.y, 8, "rgba(255, 0, 0)", Random(-10,10) / 10, Random(-10,10) / 10, 500))
							}
							bullet.yvel = -bullet.yvel 
							bullet.y = 1 + bullet.radius
							bullet.bounce = 1
							bullet.color = "rgba(255, 0, 0, 1)"
							bullet.team = 0
						}
						if (bullet.x > (canvas.width - bullet.radius - 1)){
							for(let i = 0; i < 3; i++){
								particles.push(new Particle(bullet.x, bullet.y, 8, "rgba(255, 0, 0)", Random(-10,10) / 10, Random(-10,10) / 10, 500))
							}
							bullet.xvel = -bullet.xvel 
							bullet.x = canvas.width - bullet.radius - 1
							bullet.bounce = 1
							bullet.color = "rgba(255, 0, 0, 1)"
							bullet.team = 0
						}
						if (bullet.x < (1 + bullet.radius)){
							for(let i = 0; i < 3; i++){
								particles.push(new Particle(bullet.x, bullet.y, 8, "rgba(255, 0, 0)", Random(-10,10) / 10, Random(-10,10) / 10, 500))
							}
							bullet.xvel = -bullet.xvel 
							bullet.x = 1 + bullet.radius
							bullet.bounce = 1
							bullet.color = "rgba(255, 0, 0, 1)"
							bullet.team = 0
						}
					}
				}
			}
			bullet.update()
		})
		//enemy logic
		enemies.forEach((enemy) => {
			if (enemy.health > 0) { //only execute if alive

				enemy.ai()	//execute enemy AI
				enemies.forEach((enemy2) => { //check each enemy against each other enemy for collision
					if (Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y) != 0){ //enemy avoidance AI
						enemy.xvel = enemy.xvel + (enemy.x - enemy2.x) / Math.pow(Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y), 2.1)
						enemy.yvel = enemy.yvel + (enemy.y - enemy2.y) / Math.pow(Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y), 2.1)
						
					}

					if (Pythagoras(enemy.x, enemy.y, enemy2.x, enemy2.y) <= enemy.radius + enemy2.radius && enemy !== enemy2){ //check for collision, only if not the same enemy
						
						resolveCollision(enemy, enemy2)
							
					} 
					
				})		
			}
			enemy.worldBorderCollision()
			enemy.update()		
		})
		coins.forEach((coin, listPosition) => { //player bullet logic
			coin.update()
		})
		particles.forEach((particle, listPosition) => {
			particle.update()
		})
		if (enemies.length === 0 && waveTrigger === false) { //if all enemies dead (number in the list = number killed), spawn next wave in 2.5s
			waveTrigger = true
			enemyCount = enemyCount + 1 //increase enemy count for next wave
			if (waveCount % 5 == 0 && waveCount != 0 && player.name === "dev") { //every 5 waves, show the shop
				shopTimer = new Timer(() => {
					upgradesGenerated = false
					gameState = "shop"
					shopTimer.stop()
				}, 1750)
				shopTimer.start()
			} else {
				setTimeout(SpawnWave, 2500, enemyCount, 100)
			}	
		}
		//HUD updates
		const healthBar = document.getElementById("healthBar")
		healthBar.value = player.health
		
		if (framecount % 10 == 0) {
			document.getElementById("fps").innerHTML = "FPS: " + fps
			document.getElementById("name").innerHTML = "NAME: " + player.name
			document.getElementById("score").innerHTML = "SCORE " + player.score
			document.getElementById("waves").innerHTML = "WAVE " + waveCount
			document.getElementById("coins").innerHTML = "COINS " + player.coins
		}
		let current = new Date()
		if (mouse.clicked === true && current - player.lastShot >= player.shotInterval) {
			player.lastShot = new Date()
			playSoundEffect("player_shoot", 1)
			player.gun.recoil()
			let xvel = (mouse.x - player.x) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.bulletSpeed //calculate x dir, divide by distance to normalise
			let yvel = (mouse.y - player.y) / Pythagoras(mouse.x, mouse.y, player.x, player.y) * player.bulletSpeed //calculate x dir, divide by distance to normalise
			var spread = Math.random() < 0.5 ? -0.2 : 0.2 //add spread
			player.shotsfired = player.shotsfired + 1
			bullets.push(new Bullet(1, player.x, player.y, 10, "rgb(255,250,230)", xvel + spread, yvel + spread, player.shotDamage)) //push new bullet to array
		}	
		c.fillStyle = bgColor

		player.update()
		if (player.health <= 0){ //if player reaches 0HP, game over
			player.die()
			gameState = "dead"
			animStart = new Date()
		}
	//set relevant HTML elements to visible or non-visible
	document.getElementById("titleScreen").style.display = "none"
	document.getElementById("paused").style.display = "none"	
	document.getElementById("shop").style.display = "none"
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
			pc.clearRect(0, 0, profileCanvas.width, profileCanvas.height);
			character.update()
			

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
			playSoundEffect("game_over", 1)
			getScores()
			console.log("getting scores")
			setTimeout(() => {
				console.log("determining rank")
				determineRank()
			}, 500)
			
		}
			
		
		
		
			client.submitStats()


		
			
		
	} else if (gameState === "dead") {
		if (goingToGameOver == false) {
			goingToGameOver = true
			submitScore()
			console.log("submitting score")
			setTimeout(() => {
				gameState = "game over"
				document.getElementById("fadeToBlack").style.display = "none"
				console.log("game overere")
			}, 1000)
		}
		document.getElementById("fadeToBlack").style.display = "block"
		

		enemies.forEach(enemy => {
			enemy.draw()
		})

		bullets.forEach(bullet => {
			bullet.draw()
		})

		coins.forEach(coin => {
			coin.draw()
		})

		particles.forEach(particle => {
			particle.update()
		})


		let time = new Date() - animStart
		time = (time / 900) -0.8
		document.getElementById("fadeToBlack").style.opacity = time

	} else if (gameState === "paused") { //pause menu
		//set relevant HTML elements to visible or non-visible
		
		document.getElementById("gameOverScreen").style.display = "none"
		document.getElementById("HUD").style.display = "none"
		document.getElementById("paused").style.display = "grid"
		document.getElementById("titleScreen").style.display = "none"
		document.getElementById("shop").style.display = "none"
	} else if (gameState === "shop") { //shop menu
		//set relevant HTML elements to visible or non-visible
		document.getElementById("shop").style.display = "grid"
		document.getElementById("HUD").style.display = "grid"
		document.getElementById("paused").style.display = "none"
		document.getElementById("titleScreen").style.display = "none"
		document.getElementById("gameOverScreen").style.display = "none"
		document.getElementById("upgrade1Panel").style.animation = "appearFromBottom 0.4s ease-in-out"
		document.getElementById("upgrade2Panel").style.animation = "appearFromBottom 0.45s ease-in-out"
		document.getElementById("healPanel").style.animation = "appearFromBottom 0.5s ease-in-out"
		document.getElementById("shop").style.animation = "fadeIn 0.4s ease-in-out"

		player.gun.draw()
		player.draw()
		bullets.forEach(bullet => {
			bullet.draw()
		})
		coins.forEach(coin => {
			coin.draw()
		})
		particles.forEach(particle => {
			particle.draw()
		})
		if (upgradesGenerated === false) {
			upgradesGenerated = true
			//choose shop items to display
			pickShopItems()
			document.getElementById("upgrade1Title").innerHTML = client.upgrade1.description
			document.getElementById("upgrade1Cost").innerHTML = client.upgrade1.cost + " COINS"
			document.getElementById("upgrade1Icon").src = `../images/${client.upgrade1.name}.svg`
			document.getElementById("upgrade1Icon").alt = `${client.upgrade1.name}`
			document.getElementById("upgrade2Title").innerHTML = client.upgrade2.description
			document.getElementById("upgrade2Cost").innerHTML = client.upgrade2.cost + " COINS"
			document.getElementById("upgrade2Icon").src = `../images/${client.upgrade2.name}.svg`
			document.getElementById("upgrade2Icon").alt = `${client.upgrade2.name}`

			
		}
		



	}
	if (canvas.width < canvas.height) {
		gameState = "title screen"
		menuState = "titles"
	}
 }



















//variables for controls and listeners, hoisted but left here for relevance
var friction = 100
var bulletSpeed = 10
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
let character

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
		//arrow keys for old people
		case 38: 
			W = true
			break
		case 37:
			A = true
			break
		case 40:
			S = true
			break
		case 39:
			D = true
			break

		case 27: //checks for esc key, opens pause menu if in game, closes pause menu if already paused
			if (gameState === "playing"){
				gameState = "paused"
				playSoundEffect("pause", 1)
			} else if (gameState === "paused"){
				gameState = "playing"
				playSoundEffect("unpause", 1)
			}

			if (gameState === "title screen" && menuState !== "titles") {
				menuState = "titles"
				playSoundEffect("unpause", 1)
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
	//arrow keys for old people
	case 38: 
		W = false
		break
	case 37:
		A = false
		break
	case 40:
		S = false
		break
	case 39:
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
	playSoundEffect("/ui/play_button", 1)
	player.name = document.getElementById("nameBox").value || "Guest"
	console.log(player.name)
})

//OPTIONS BUTTON//
const optionsButton = document.getElementById("optionsButton")
optionsButton.addEventListener("click", () => {
	menuState = "options"
	playSoundEffect("/ui/button", 1)
})




//OPTIONS BACK BUTTON
const optionsBackButton = document.getElementById("optionsBackButton")
optionsBackButton.addEventListener("click", () => {
	menuState = "titles"
	playSoundEffect("/ui/button", 1)
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
	playSoundEffect("/ui/button", 1)
	character = new CharacterShowcase(128, "rgb(0,255,255)")
})


//DISCORD BUTTON//
const discordButton = document.getElementById("discordButton")
discordButton.addEventListener("click", () => {
	window.open("https://discord.gg/k5Grv8F")
	playSoundEffect("/ui/button", 1)
})
//GITHUB BUTTON//
const githubButton = document.getElementById("githubButton")
githubButton.addEventListener("click", () => {
	window.open("https://github.com/TRGRally")
	playSoundEffect("/ui/button", 1)
})


//LOGIN OR REGISTER MENU BUTTON//
const loginRegisterButton = document.getElementById("loginRegisterButton")
loginRegisterButton.addEventListener("click", () => {
	if (client.auth == true) {
		return
	}
	menuState = "loginRegister"
	playSoundEffect("/ui/button", 1)
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
	playSoundEffect("/ui/button", 1)
})
loginRegisterButton.style.display = "none"

//register BUTTON//
const registerButton = document.getElementById("registerButton")
registerButton.addEventListener("click", () => {
	let username = document.getElementById("loginUsername").value
	let password = document.getElementById("loginPassword").value
	register(username, password)
	playSoundEffect("/ui/button", 1)
})



//REFRESH SCORES BUTTON (MAIN MENU)//
const refreshScoresButton = document.getElementById("refreshScores")
refreshScoresButton.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
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
	playSoundEffect("/ui/button", 1)
	open("https://trgrally.dev/about")
})

//MORE GAMES BUTTON//
const moreGamesButton = document.getElementById("moreGamesButton")
moreGamesButton.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
	open("https://trgrally.dev/gearhop")
})

//PROFILE BACK BUTTON

const profileBackButton = document.getElementById("profileBackButton")
profileBackButton.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
	menuState = "titles"
})

//GAME OVER RETURN BUTTON
const returnToMenu = document.getElementById("returnToMenu")
returnToMenu.addEventListener("click", () => {
	gameState = "title screen"
	menuState = "titles"
	playSoundEffect("/ui/button", 1)
	resetValues()
})

//shop buttons
const upgrade1Hitbox = document.getElementById("upgrade1Hitbox") 
const upgrade1 = document.getElementById("upgrade1Panel")
upgrade1Hitbox.addEventListener("click", () => {
	if (player.applyUpgrade(client.upgrade1)) {
		playSoundEffect("/ui/button", 1)
		upgrade2.style.animation = "disappearToBottom 0.3s ease-in-out"
		heal.style.animation = "disappearToBottom 0.3s ease-in-out"
		setTimeout(() => {
			setTimeout(SpawnWave, 1500, enemyCount, 100)
			gameState = "playing"
		}, 300)
	} else {
		playSoundEffect("/enemy_hurt", 1)
		console.log("not enough coins")
	}
	console.log("clicked upgrade1")
})

const upgrade2Hitbox = document.getElementById("upgrade2Hitbox") 
const upgrade2 = document.getElementById("upgrade2Panel")
upgrade2Hitbox.addEventListener("click", () => {
	if (player.applyUpgrade(client.upgrade2)) {
		playSoundEffect("/ui/button", 1)
		console.log("upgrade2 applied")
		upgrade1.style.animation = "disappearToBottom 0.3s ease-in-out"
		heal.style.animation = "disappearToBottom 0.3s ease-in-out"
		setTimeout(() => {
			setTimeout(SpawnWave, 1500, enemyCount, 100)
			gameState = "playing"
		}, 300)
	} else {
		playSoundEffect("/enemy_hurt", 1)
		console.log("not enough coins")
	}
	console.log("clicked upgrade2")
})

const healHitbox = document.getElementById("healHitbox") 
const heal = document.getElementById("healPanel")
healHitbox.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
	upgrade1.style.animation = "disappearToBottom 0.3s ease-in-out"
	upgrade2.style.animation = "disappearToBottom 0.3s ease-in-out"
	setTimeout(() => {
		setTimeout(SpawnWave, 1500, enemyCount, 100)
		gameState = "playing"
	}, 300)
	player.applyUpgrade("heal")
	console.log("clicked heal")

})


//PAUSE MENU BUTTONS

//resume button
const resumeButton = document.getElementById("resume")
resumeButton.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
	gameState = "playing"
})

//save and exit button
const quitButton = document.getElementById("quit")
quitButton.addEventListener("click", () => {
	playSoundEffect("/ui/button", 1)
	gameState = "title screen"
	menuState = "titles"
	resetValues()
})



//all buttons hover noise
document.addEventListener("mouseover", (event) => {
	if (event.target.matches(".button") || event.target.matches(".sidebutton") || event.target.matches(".upgradeHitbox")) {
	  // one of the buttons was clicked
	  const button = event.target
	  playSoundEffect("/ui/button_hover", 0.2)
	}
  })

//all buttons mouseout noise
document.addEventListener("mouseout", (event) => {
	if (event.target.matches(".button") || event.target.matches(".sidebutton") || event.target.matches(".upgradeHitbox")) {
		const button = event.target
		playSoundEffect("/ui/button_mouseout", 0.1)
	}
})





















async function submitScore(){ //AJAX REQUEST: creates server POST request to store the player's score and name into the database
	if (player.name === "dev") return
	
	var params = "name=" + player.name + "&" + "score=" + player.score //format params for the POST request
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

async function getScores(){ //AJAX REQUEST: creates server GET request to retrieve the stored scores information form the database
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
					if (client.auth === true && client.username == scoreData[entry].Player) {
						let boldname = `<b>${scoreData[entry].Player}</b>`
						playerCell.innerHTML = boldname
					} else {
						playerCell.innerHTML = scoreData[entry].Player
					}
					scoreCell.innerHTML = scoreData[entry].Score

				}
				document.getElementById("leaderboardContent").innerHTML += "</table>"

			} else if (gameState === "game over" || gameState === "dead") { //if on game over, show on game over screen
				let table = document.getElementById("gameOverScoreTable")
				table.innerHTML = ""
				for (let entry = 0; entry < scoreData.length; entry++) {
					let rank = entry + 1
					let row = table.insertRow(entry)
					let rankCell = row.insertCell(0)
					let playerCell = row.insertCell(1)
					let scoreCell = row.insertCell(2)
					rankCell.innerHTML = `${rank}.`
					if (client.auth === true && client.username == scoreData[entry].Player) {
						let boldname = `<b>${scoreData[entry].Player}</b>`
						playerCell.innerHTML = boldname
					} else {
						playerCell.innerHTML = scoreData[entry].Player
					}
					scoreCell.innerHTML = scoreData[entry].Score
			}
			} else if (this.status == 404){ //404 = no file code
			console.log("Error 404, file not found.")
			}
		}
	}

	request.onerror = function(){ //error handle
		console.log("There was an error with the request, are you connected to the internet?")
	}

	//send request to the server
	request.send()
}


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

function getUpgrades() {
	fetch("../upgrades.json")
	.then(res => {
		return res.json()
	})
	.then(data => upgrades = data.upgrades)
}

function pickShopItems() {
	//upgrade 1
	let upgrade1 = Math.floor(Math.random() * upgrades.length)
	//upgrade 2
	let upgrade2 = Math.floor(Math.random() * upgrades.length)
	while (upgrade2 === upgrade1) {
		upgrade2 = Math.floor(Math.random() * upgrades.length)
	}
	client.upgrade1 = upgrades[upgrade1]
	client.upgrade2 = upgrades[upgrade2]
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
				client.login(username, password)
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

function resetValues() { //prepare new game by resetting values
	savedScore = false
	goingToGameOver = false
	bullets = []
	coins = []
	enemies = []
	deadEnemies = 0
	waveCount = 0
	enemyCount = 0
}

function init() { //called on startup - make sure menu is correct
	client = new Client()
	gameState = "title screen"
	menuState = "titles"
	
	getUpgrades()
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


