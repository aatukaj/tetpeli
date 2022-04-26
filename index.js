ctx = canvas.getContext("2d")
tileSize = 50

function newImage(src) {
    let img = new Image()
    img.src = src
    return img
}
function floorToMul(num, mul) {
    return Math.floor(num / mul) * mul
}

let carrotsprite = newImage('images/carrot.png')
let carrots = []
let wallsprite = newImage('images/wall.png')
let walls = []

const player = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    sprites: {
        up: newImage("images/rabbitup.png"),
        down: newImage("images/rabbitdown.png"),
        left: newImage("images/rabbitleft.png"),
        right: newImage("images/rabbitright.png"),
    },
}
Object.freeze(player.sprites)
player.sprite = player.sprites.up

const mouse = {
    x: 0,
    y: 0
}
canvas.onmousemove = event => {
    mouse.x = event.offsetX
    mouse.y = event.offsetY
}

document.onclick = () => {
    x = floorToMul(mouse.x, tileSize)
    y = floorToMul(mouse.y, tileSize)
    for (let wall of walls) {
        if (x == wall.x && y == wall.y) {
            walls.splice(walls.indexOf(wall), 1)
            return
        }
    }
    for (let carrot of carrots)
        if (x == carrot.x && y == carrot.y) {
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
        for (let carrot of carrots.concat(walls, [player])) {
            if (carrot.x == x && carrot.y == y) {
                colliding = true
                break
            }
        }
    }
    carrots.push({
        x: x,
        y: y
    })
}
for (let i = 0; i < 10; i++) {
    randomCarrot()
}

document.onkeydown = event => {
    if (event.repeat) { return }
    let x = player.tx
    let y = player.ty
    if (player.x == player.tx) {
        if (event.key == "ArrowUp" && player.ty > 0) {
            y -= tileSize
            player.sprite = player.sprites.up

        } else if (event.key == "ArrowDown" && player.ty < canvas.height - tileSize) {
            y += tileSize
            player.sprite = player.sprites.down
        }
    }
    if (player.y == player.ty) {
        if (event.key == "ArrowRight" && player.tx < canvas.width - tileSize) {
            x += tileSize
            player.sprite = player.sprites.right

        } else if (event.key == "ArrowLeft" && player.tx > 0) {
            x -= tileSize
            player.sprite = player.sprites.left
        }
    }

    for (let wall of walls) {
        if (wall.x == x && wall.y == y) { return }
    }
    player.tx = x
    player.ty = y

    if (event.key == "f") {
        randomCarrot()
    }
}

setInterval(() => {
    for (let carrot of carrots) {
        if (carrot.x == Math.round(player.x) && carrot.y === Math.round(player.y)) {
            carrots.splice(carrots.indexOf(carrot), 1)
            break
        }
    }
    if (player.x != player.tx) {
        player.x += Math.sign(player.tx - player.x) * (tileSize / 25)
    }
    if (player.y != player.ty) {
        player.y += Math.sign(player.ty - player.y) * (tileSize / 25)
    }
})

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "darkgreen"
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

    for (let carrot of carrots) {
        ctx.drawImage(carrotsprite, carrot.x, carrot.y, tileSize, tileSize)
    }
    for (let wall of walls) {
        ctx.drawImage(wallsprite, wall.x, wall.y, tileSize, tileSize)
    }
    ctx.drawImage(player.sprite, player.x, player.y, tileSize, tileSize)

    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)