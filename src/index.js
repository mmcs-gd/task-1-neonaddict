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

function checkBallBordersCollision(ball) {
    if ((ball.x > canvas.width) || (ball.x < 0)) {
        ball.vx = -ball.vx
    }

    if ((ball.y < 0)) {
        ball.vy = -ball.vy
    }
    
    if ((ball.y > canvas.height)) {
        stopGame(gameState.stopCycle)
        //ball.vy = -ball.vy
    }

}

function checkBonusBordersCollision(bonus) {
    if ((bonus.x > canvas.width) || (bonus.x < 0)) {
        bonus.vx = -bonus.vx
    }

    if ((bonus.y < 0)) {
        bonus.vy = -bonus.vy
    }
    
    if ((bonus.y > canvas.height)) {
        bonus.isVisible = false
    }

}


// This is not DRY. Refactor :(
function checkBallPlatformCollision(ball) {
    const player = gameState.player
    if ((ball.x > player.x - gameState.player.width/2) && 
        (ball.x < player.x + player.width/2) &&
        (ball.y + ball.radius >= canvas.height - player.height)) {
        ball.vy = -ball.vy
        ball.vx += (ball.x - player.x) * 0.1
    }
}

// This is not DRY. Refactor :(
function checkBonusPlatformCollision(bonus) {
    const player = gameState.player
    if ((bonus.x > player.x - player.width/2) && 
        (bonus.x < player.x + player.width/2) &&
        ((bonus.y + bonus.fontHeight / 10) >= (canvas.height - player.height))) {
        gameState.count.score += 15
        bonus.isVisible = false
    }
}

// This is not DRY. Refactor :(
function checkBallCollisions(ball) {
    checkBallPlatformCollision(ball)
    checkBallBordersCollision(ball)
}

function checkBonusCollisions(bonus) {
    if (bonus.isVisible) {
        checkBonusPlatformCollision(bonus)
        checkBonusBordersCollision(bonus)
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "#1F161C";
    context.fillRect(0,0,canvas.width,canvas.height);

    drawPlatform(context)
    drawBall(context)
    drawCount(context)
    drawBonus(context)
}

function update(tick) {

    const vx = (gameState.pointer.x - gameState.player.x) / 10
    const count = gameState.count
    const ball = gameState.ball
    const bonus = gameState.bonus
    
    gameState.player.x += vx
    checkBallCollisions(ball)
    checkBonusCollisions(bonus)

    ball.y += ball.vy
    ball.x += ball.vx
    
    addCount(count)
    addSpeed(ball)
    spawnBonus(bonus)
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

function spawnBonus(bonus) {
    if (timeForBonus()) {
        bonus.isVisible = true;
        bonus.x = getRandomArbitrary(0,canvas.width)
        bonus.y = getRandomArbitrary(0, canvas.height / 2)
        bonus.vx = 0;
        bonus.vy = 0;
    }
    bonus.vy = 1
    bonus.x += bonus.vx
    bonus.y += bonus.vy
}

function timeForBonus() {
    if (!gameState.bonus.isVisible && gameState.lastTick - gameState.lastBonusTick >= 2000) {
        gameState.lastBonusTick = gameState.lastTick;
        return true
    } else {
        return false
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
    context.fillStyle = "#DA288D";
    context.shadowBlur = 10;
    context.shadowColor = "#dce1e6";
    context.fill();
    context.closePath();
}

function drawBall(context) {
    const {x, y, radius} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = "#2992BA";
    context.fill();
    context.closePath();
}

function drawCount(context) {
    const {x, y, width, height, score} = gameState.count;
    context.beginPath()
    context.rect(x, y, width , height)
    context.strokeStyle = "#9ff3fc";
    context.stroke()
    context.closePath()
    context.font = "14px sans-serif";
    context.fillStyle = "#9ff3fc";
    context.fillText("Score: " + score, x + width/4, y + height/2 + 0.5);
}

function drawBonus(context) {
    if (!gameState.bonus.isVisible) return
    
    const {x, y, width, height} = gameState.bonus
    context.fillStyle = '#9ff3fc';
    context.font = gameState.bonus.fontHeight + "px sans-serif";
    context.fillText("+", x, y);
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastScoreTick = gameState.lastTick;
    gameState.lastSpeedupTick = gameState.lastTick;
    gameState.lastBonusTick = gameState.lastTick;
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

    gameState.bonus = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 100,
        height: 100,
        isVisible: false,
        fontHeight: 80
    }
}

setup();
run();
