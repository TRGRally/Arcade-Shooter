//get buttons
let discord = document.getElementById("discord")
let steam = document.getElementById("steam")
//links that the buttons will send the user to
let discordLink = "https://discord.gg/k5Grv8F"
let steamLink = "https://steamcommunity.com/profiles/76561198858080271/"
//button click logic
discord.addEventListener("click", () => {
    open(discordLink)
})
steam.addEventListener("click", () => {
    open(steamLink)
})
//canvas
var canvas = document.getElementById("canvas")
var c = canvas.getContext("2d", {desynchronized:true})
c.globalAlpha = 0.0
canvas.width = innerWidth
canvas.height = innerHeight
c.imageSmoothingEnabled = true
//mouse
let mouse = { 	//mouse object for coords
	x: innerWidth / 2,
	y: innerHeight / 2,
	clicked: false
}
addEventListener("mousemove", function(event) { //update mouse object coords every time move event detected
	mouse.x = event.clientX
	mouse.y = event.clientY
})
//window resize
addEventListener("resize", function() { //update render window size when the browser window size is changed
	canvas.width = innerWidth
	canvas.height = innerHeight
})
//utility functions
function Random(lower, upper) {
	return Math.floor(Math.random() * (upper - lower + 1) + lower)
}
function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max)
}
//classes
class Point {
    constructor(){
        this.maxAlpha = clamp(0.4 + Random(0.00, 0.50), 0.0000000, 1.0000000)
        this.color=`rgba(150,150,150,${this.a})`
        this.radius = 2.0
        this.x = Random(5, innerWidth - 5)
        this.y = Random(5, innerHeight - 5)
		this.prevxvel = 0 
		this.prevyvel = 0
		this.xvel = Random(-1.00000, 1.00000)
		this.yvel = Random(-1.00000, 1.00000)
		this.dyvel = 0.00001
		this.dxvel = 0.00001
		this.angle = 0
    }
    
    draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowColor = this.color
		c.lineWidth = 2
		c.fill()
		c.closePath()
	}

    distSqToMouse() {
		return ((this.x - mouse.x) * (this.x - mouse.x)) + ((this.y - mouse.y) * (this.y - mouse.y) )
	}

	drawTrail() {
		c.save()
		let grd = c.createLinearGradient(0, 0, 0, ((this.xvel * this.xvel) + (this.yvel * this.yvel)))
		grd.addColorStop(0, `rgba(150,150,150,${this.a / 1.5})`)
		grd.addColorStop(0.4, `rgba(150,150,150,${0})`)
		c.translate(this.x, this.y)
		c.rotate(this.angle)
		c.beginPath()
		c.rect(-(this.radius / 2), 0, 2, 4 *Math.sqrt(((this.xvel * this.xvel) + (this.yvel * this.yvel))))
		
		c.fillStyle = grd
		c.fill()
		c.closePath()
		c.restore()
	}

    update() { //calls draw and changes coords based on velocity - ease of use function
        this.a = clamp((this.maxAlpha - (this.distSqToMouse() / 400000)), 0.0000000, 1.00000000)
        this.color=`rgba(150,150,150,${this.a})`
		
		this.prevxvel = this.xvel
		this.prevyvel = this.yvel
		this.xvel = this.xvel + Random(-0.01000, 0.01000)
		
		this.yvel = this.yvel + Random(-0.01000, 0.01000)
		
		this.xvel = this.xvel * 0.999
		this.yvel = this.yvel * 0.999
		this.x = this.x + this.xvel
		this.y = this.y + this.yvel
		if (this.x > (innerWidth - this.radius)) {
			this.x = innerWidth - this.radius
			this.xvel = -this.xvel / 1.3
		}
		if (this.x < (this.radius)) {
			this.x = this.radius
			this.xvel = -this.xvel / 1.3
		}
		if (this.y > (innerHeight - this.radius)) {
			this.y = innerHeight - this.radius
			this.yvel = -this.yvel / 1.3
		}
		if (this.y < (this.radius)) {
			this.y = this.radius
			this.yvel = -this.yvel / 1.3
		}
		this.angle =  3.141 -Math.atan2(this.xvel, this.yvel)
		this.draw()
		this.drawTrail()
	}
}

let points = []
for (let i = 0; i < 100; i++) {
	points.push(new Point())
}
let point1 = new Point()
function gameplayLoop() {
	c.fillStyle = "rgba(21,20,20,1)"
	c.fillRect(0, 0, innerWidth, innerHeight)
	point1.update()
	points.forEach(point => {
		point.update()
	})
    requestAnimationFrame(gameplayLoop)
}

const isMobile = navigator.userAgentData.mobile
if (isMobile === false) {
	gameplayLoop()
}
