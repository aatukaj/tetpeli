"use strict"
const ctx = canvas.getContext("2d")
const tileSize = 50

function newImage(src) {
    let img = new Image()
    img.src = src
    return img
}
function floorToMul(num, mul) {
    return Math.floor(num / mul) * mul
}

const carrotsprite = newImage("images/carrot.png")
let carrots = []
const wallsprite = newImage("images/wall.png")
let walls = []
let path = []
let cmds = []
let points = 0
function getCollision(object, objects) {
    for (let o of objects) {
        if (o.x == object.x && o.y == object.y) {
            return o
        }
    }
}

class Entity {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.tx = x
        this.ty = x
        this.isMoving = true
        this.text = ""
        this.speaking = false
        this.sprites = {
            up: newImage("images/rabbitup.png"),
            down: newImage("images/rabbitdown.png"),
            left: newImage("images/rabbitleft.png"),
            right: newImage("images/rabbitright.png"),
        }
        this.sprite = this.sprites.up
    }
    update() {
        if (this.isMoving) {
            if (Math.round(this.x) == this.tx) {
                this.x = this.tx
            } else {
                this.x += Math.sign(this.tx - this.x) * (tileSize / 50)
            }

            if (Math.round(this.y) == this.ty) {
                this.y = this.ty
            } else {
                this.y += Math.sign(this.ty - this.y) * (tileSize / 50)
            }
            if (this.y == this.ty && this.x == this.tx) {
                this.isMoving = false
                path.push({
                    x: this.x,
                    y: this.y,
                })
            }
        }
        const collision = getCollision(this, carrots)
        if (collision) {
            carrots.splice(carrots.indexOf(collision), 1)
            points += 1
        }
    }
    handleMovement(dir) {
        let x = this.tx
        let y = this.ty
        this.sprite = this.sprites[dir]

        if (this.x == this.tx) {
            if (dir == "up" && this.ty > 0) {
                y -= tileSize
            } else if (dir == "down" && this.ty < canvas.height - tileSize) {
                y += tileSize
            }
        }
        if (this.y == this.ty) {
            if (dir == "right" && this.tx < canvas.width - tileSize) {
                x += tileSize
            } else if (dir == "left" && this.tx > 0) {
                x -= tileSize
            }
        }
        if (getCollision({
            x: x,
            y: y
        }, walls)) {
            return
        }

        this.tx = x
        this.ty = y
        this.isMoving = true
    }

    say(text) {
        clearTimeout(this.sayTimeout);
        this.speaking = true
        this.text = text
        this.sayTimeout = setTimeout(() => {
            this.speaking = false
            this.text = false
        }, 2000)
    }
}

let entities = {
}
const mouse = {
    x: 0,
    y: 0
}

canvas.onmousemove = event => {
    mouse.x = event.offsetX
    mouse.y = event.offsetY
}

canvas.onclick = () => {
    let x = floorToMul(mouse.x, tileSize)
    let y = floorToMul(mouse.y, tileSize)
    const collision = getCollision({
        x: x,
        y: y
    }, walls)
    if (collision) {
        walls.splice(walls.indexOf(collision), 1)
        return
    }
    if (getCollision({
        x: x,
        y: y
    }, carrots)) {
        return
    }
    walls.push({
        x: x,
        y: y,
    })
}

function randomCarrot() {
    let colliding = true
    let x, y
    while (colliding) {
        colliding = false
        x = floorToMul(Math.random() * canvas.width, tileSize)
        y = floorToMul(Math.random() * canvas.height, tileSize)
        const result = getCollision({
            x: x,
            y: y
        }, carrots.concat(walls, Object.values(entities)))
        if (result) {
            colliding = true
            break
        }
    }
    carrots.push({
        x: x,
        y: y
    })
}

for (let i = 0; i < 40; i++) {
    randomCarrot()
}

setInterval(() => {
    for (let e of Object.values(entities)) {
        e.update()
    }
})
setInterval(() => {
    if (cmds.length != 0) {
        const command = cmds[0].split(":")
        const type = command[0]
        const args = command[1].split(",")
        cmds.shift()
        if (type == "move") {
            entities[args[0]].handleMovement(args[1])
        }
        if (type == "say") {
            entities[args[0]].say(args[1])
        }
        if (type == "addEntity") {
            entities[args[0]] = new Entity(args[1] * tileSize, args[2] * tileSize)
            console.log(entities)
        }

    }
}, 500)

function addCmd(cmd) {
    cmds.push(cmd)
}


function reset() {
    cmds = []
    entities = {}
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "gray"
    ctx.setLineDash([4, 2])
    ctx.beginPath()


    for (let i = tileSize; i < canvas.width; i += tileSize) {
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
    }
    for (let i = tileSize; i < canvas.height; i += tileSize) {
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
    }
    ctx.stroke()

    ctx.setLineDash([0])
    ctx.fillStyle = "lightgray"
    for (let part of path) {
        ctx.beginPath()
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
    }

    for (let carrot of carrots) {
        ctx.drawImage(carrotsprite, carrot.x, carrot.y, tileSize, tileSize)
    }
    for (let wall of walls) {
        ctx.drawImage(wallsprite, wall.x, wall.y, tileSize, tileSize)
    }
    ctx.setLineDash([1, 1])

    for (let e of Object.values(entities)) {
        ctx.drawImage(e.sprite, e.x, e.y, tileSize, tileSize)
        if (e.speaking) {
            ctx.textAlign = "left"
            ctx.textBaseline = 'top';
            ctx.font = '24px arial';
            const textSize = ctx.measureText(e.text)
            ctx.fillStyle = "white"
            const padding = 4
            ctx.beginPath();
            ctx.fillRect(e.x - padding, e.y - padding, textSize.width + padding*2, 24+padding*2)
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "black"
            ctx.fillText(e.text, e.x, e.y);
        }
    }
    ctx.fillStyle = "white"
    ctx.font = '48px arial';
    ctx.textAlign = "right"
    ctx.textBaseline = "bottom";
    ctx.fillText(points + "/10", 125, canvas.height - 10);



    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)