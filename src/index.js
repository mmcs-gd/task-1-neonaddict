const canvas = document.getElementById("cnvs");

const gameState = {};

function onMouseMove(e) {
    gameState.pointer.x = e.pageX;
    gameState.pointer.y = e.pageY
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function checkBordersCollision(ball) {
    if ((ball.x > canvas.width) || (ball.x < 0)) {
        ball.vx = -ball.vx
    }

    if ((ball.y < 0)) {
        ball.vy = -ball.vy
    }
    
    if ((ball.y > canvas.height)) {
        //stopGame(gameState.stopCycle)
        ball.vy = -ball.vy
    }

}

function checkPlatformCollision(ball) {
    const player = gameState.player
    if ((ball.x > player.x - gameState.player.width/2) && 
        (ball.x < player.x + player.width/2) &&
        (ball.y + ball.radius >= canvas.height - player.height)) {
        ball.vy = -ball.vy
        ball.vx += (ball.x - player.x) * 0.1
    }
}

function checkCollisions(ball) {
    checkPlatformCollision(ball)
    checkBordersCollision(ball)

    ball.y += ball.vy
    ball.x += ball.vx
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform(context)
    drawBall(context)
    drawCount(context)
}

function update(tick) {

    const vx = (gameState.pointer.x - gameState.player.x) / 10
    gameState.player.x += vx

    const ball = gameState.ball
    checkCollisions(ball)
    
    const count = gameState.count
    addCount(count)
    addSpeed(ball)

}

function addCount(count) {
    if (gameState.lastTick - gameState.lastScoreTick >= 1000) {
        count.score += 1
        gameState.lastScoreTick = gameState.lastTick;
    }
}

function addSpeed(ball) {
    if (gameState.lastTick - gameState.lastSpeedupTick >= 30000) {
        ball.vx *= 1.1
        ball.vy *= 1.1
        gameState.lastSpeedupTick = gameState.lastTick
    }
}

function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function stopGame(handle) {
    window.cancelAnimationFrame(handle);
}

function drawPlatform(context) {
    const {x, y, width, height} = gameState.player;
    context.beginPath();
    context.rect(x - width / 2, y - height / 2, width, height);
    context.fillStyle = "#FF0000";
    context.fill();
    context.closePath();
}

function drawBall(context) {
    const {x, y, radius} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = "#0000FF";
    context.fill();
    context.closePath();
}

function drawCount(context) {
    const {x, y, width, height, score} = gameState.count;
    context.beginPath()
    context.rect(x+1, y, width , height)
    context.strokeStyle = '#000000'
    context.stroke()
    context.closePath()
    context.font = "14px serif";
    context.fillText("Score: " + score, x + width/4, y + height/2);
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastScoreTick = gameState.lastTick;
    gameState.lastSpeedupTick = gameState.lastTick;
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms

    const platform = {
        width: 400,
        height: 50,
    };

    gameState.player = {
        x: 100,
        y: canvas.height - platform.height / 2,
        width: platform.width,
        height: platform.height
    };
    gameState.pointer = {
        x: 0,
        y: 0,
    };
    gameState.ball = {
        x: canvas.width / 2,
        y: 0,
        radius: 25,
        vx: Math.random(1),
        vy: 5
    }
    gameState.count = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        score: 0
    }
}

setup();
run();
