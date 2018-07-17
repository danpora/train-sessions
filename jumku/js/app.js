let canvas;
let ctx;

let CANVAS_WIDTH;
let CANVAS_HEIGHT;

let isGameActive = true;

const MAX_OBSTACLE_SPEED = 7;
const HORIZON_HEIGHT = 160;
const MAX_OBSTACLE_LENGTH = 50;
const MIN_OBSTACLE_LENGTH = 20;
const JUMP_SPEED = -10;

let difficultyFactor;
let updateInterval;
let timer;

function initGame() {
  difficultyFactor = 0.006;
  updateInterval = 4000;
  timer = 0;
}

function setup() {
  canvas = document.getElementById('canvas-container');
  ctx = canvas.getContext('2d');
  CANVAS_WIDTH = canvas.width;
  CANVAS_HEIGHT = canvas.height;

  initGame();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function resetGame() {
  location.reload();
}

function onKeyPress(event) {
  if (event.code === 'Space') {
    handleUserJump();
  }
}

function handleUserJump() {
  ball.jump();
}

const obstacles = {
  positions: [],
  velocity: 4,

  create: function() {
    const height = getRandomInt(MIN_OBSTACLE_LENGTH, MAX_OBSTACLE_LENGTH);
    const width = getRandomInt(MIN_OBSTACLE_LENGTH, MAX_OBSTACLE_LENGTH);

    const yPos = HORIZON_HEIGHT - height;
    const xPos = CANVAS_WIDTH;

    const color = getRandomColor();

    this.positions.push({
      xPos,
      yPos,
      height,
      width,
      color,
    });
  },

  update: function() {
    for (let pos = this.positions.length - 1; pos >= 0; pos--) {
      if (this.positions[pos].xPos + this.positions[pos].width <= 0) {
        this.positions.splice(pos, 1);
      } else {
        this.positions[pos].xPos = this.positions[pos].xPos - this.velocity;
      }
    }
  },

  draw: function() {
    for (let pos of this.positions) {
      ctx.fillStyle = pos.color;
      ctx.beginPath();
      ctx.rect(pos.xPos, pos.yPos, pos.width, pos.height);
      ctx.fill();
    }
  },
};

const ball = {
  radius: 25,
  xPos: 40,
  yPos: 135,
  xVel: 0,
  yVel: 0,

  cycle: function() {
    this.draw();
    this.update();
  },

  draw: function() {
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  },

  jump: function() {
    const ballBottom = this.yPos + this.radius;

    if (ballBottom >= HORIZON_HEIGHT - 3) {
      this.yVel = JUMP_SPEED;
    }
  },

  update: function() {
    const ballBottom = this.yPos + this.radius;

    if (ballBottom >= HORIZON_HEIGHT && this.yVel > JUMP_SPEED) {
      this.yVel = 0;
      this.yPos = HORIZON_HEIGHT - this.radius;

      return;
    }

    if (ballBottom <= HORIZON_HEIGHT) {
      this.yVel += 0.5;
      this.yPos += this.yVel;
    }
  },
};

function dist(x1, y1, x2, y2) {
  const diffX = Math.abs(x1 - x2);
  const diffY = Math.abs(y1 - y2);
  return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}

function isCollision() {
  const obstacleSide = 40;
  const rocks = obstacles.positions;
  const centerBallX = ball.xPos;
  const centerBallY = ball.yPos;
  const ballRadius = ball.radius;

  for (let rock of rocks) {
    const centerRockX = rock.xPos + obstacleSide / 2;
    const centerRockY = rock.yPos + obstacleSide / 2;
    const diff = ballRadius + obstacleSide / 2;

    return dist(centerBallX, centerBallY, centerRockX, centerRockY) < diff;
  }
}

function updateGameLevel() {
  const rand = Math.random();

  if (rand < 0.5) {
    obstacles.create();

    if (obstacles.velocity < 7) {
      obstacles.velocity = obstacles.velocity * 1.05;
    }
  }

  if (updateInterval > 700) {
    updateInterval *= 0.8;
  }

  setTimeout(updateGameLevel, updateInterval);
}

function renderBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f1f6ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderRoad() {
  ctx.beginPath();
  ctx.moveTo(0, HORIZON_HEIGHT);
  ctx.lineTo(canvas.width, HORIZON_HEIGHT);
  ctx.stroke();
}

function incTimer(now) {
  timer = Math.trunc(now / 100);
}

function renderScore() {
  ctx.font = '30px Comic Sans MS';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText('Score: ' + timer, canvas.width / 2, 50);
}

function draw(now) {
  incTimer(now);

  renderBackground();
  renderRoad();
  renderScore();

  if (isCollision()) {
    const isOk = confirm('game is over!, refresh to start over.');

    if (isOk) {
      resetGame();
    }

    isGameActive = isOk;
  }

  obstacles.update();
  ball.update();
  obstacles.draw();
  ball.draw();

  if (isGameActive) {
    window.requestAnimationFrame(draw);
  }
}

setTimeout(updateGameLevel, updateInterval);

window.addEventListener('keypress', onKeyPress);
window.requestAnimationFrame(draw);
