let snake;

const BLOCK = 10;
const DRAW_RATE = 30;

const WIDTH_SCALE = 0.9;
const HEIGHT_SCALE = 0.9;

const WIDTH = window.innerWidth * WIDTH_SCALE;
const HEIGHT = window.innerHeight * HEIGHT_SCALE;

const initialSnake = [
  { x: 0, y: 0 },
  { x: BLOCK, y: 0 },
  { x: 2 * BLOCK, y: 0 },
  { x: 3 * BLOCK, y: 0 },
  { x: 4 * BLOCK, y: 0 },
  { x: 5 * BLOCK, y: 0 },
  { x: 6 * BLOCK, y: 0 },
  { x: 7 * BLOCK, y: 0 },
];

const ORIENTATION_MAP = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

function setup () {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent('app');

  frameRate(DRAW_RATE);
  document.addEventListener('keydown', onKeyPress);

  snake = new Snake();
}

function onKeyPress (event) {
  switch (event.key) {
    case 'ArrowDown':
      if (snake.orientation !== ORIENTATION_MAP.up) {
        snake.orientation = ORIENTATION_MAP.down;
      }
      break;
    case 'ArrowUp':
      if (snake.orientation !== ORIENTATION_MAP.down) {
        snake.orientation = ORIENTATION_MAP.up;
      }
      break;
    case 'ArrowLeft':
      if (snake.orientation !== ORIENTATION_MAP.right) {
        snake.orientation = ORIENTATION_MAP.left;
      }
      break;
    case 'ArrowRight':
      if (snake.orientation !== ORIENTATION_MAP.left) {
        snake.orientation = ORIENTATION_MAP.right;
      }
      break;
  }
}

function createFood (chains) {
  while (1) {
    const randX = Math.floor(Math.random() * WIDTH/BLOCK);
    const randY = Math.floor(Math.random() * HEIGHT/BLOCK);
    
    const isPartOfChain = chains.some(function (chain) {
      return chain.x === randX && chain.y === randY;
    });

    if (!isPartOfChain) {
      return {
        x: randX,
        y: randY,
      };
    }
  }
}

function Snake () {
  this.orientation = ORIENTATION_MAP.right;
  this.body = [...initialSnake];
  this.food = createFood(this.body);
  this.foodCount = 0;

  this.init = function () {
    this.body = [...initialSnake];
    this.foodCount = 0;
    this.orientation = ORIENTATION_MAP.right;
  };

  this.setNextOrientedHead = function (lastHead) {
    switch (this.orientation) {
      case 1:
        lastHead.x = lastHead.x + BLOCK;
        break;
      case 3:
        lastHead.x = lastHead.x - BLOCK;
        break;
      case 0:
        lastHead.y = lastHead.y - BLOCK;
        break;
      case 2:
        lastHead.y = lastHead.y + BLOCK;
        break;
    }
  };

  this.eat = function () {
    const head = Object.assign({}, this.body[this.body.length - 1]);
    const isSameX = Math.abs(head.x - this.food.x) < BLOCK;
    const isSameY = Math.abs(head.y - this.food.y) < BLOCK;

    const lastHead = Object.assign({}, this.body[this.body.length - 1]);
    this.setNextOrientedHead(lastHead);

    if (isSameX && isSameY) {
      this.body.push(lastHead);
      this.foodCount = this.foodCount + 1;
      this.food = createFood(this.body);
    }
  };

  this.update = function () {
    const lastHead = Object.assign({}, this.body[this.body.length - 1]);
    this.setNextOrientedHead(lastHead);
    this.body.splice(0, 1);
    this.body.push(lastHead);
  };

  this.isDead = function () {
    const head = this.body[this.body.length - 1];

    for (let idx = 0; idx < this.body.length - 2; idx++) {
      const isSameX = head.x === this.body[idx].x;
      const isSameY = head.y === this.body[idx].y;
      if (isSameX && isSameY) return true;
    }

    if (head.x + BLOCK > WIDTH) return true;
    if (head.y + BLOCK > HEIGHT) return true;
    if (head.x < 0) return true;
    if (head.y < 0) return true;

    return false;
  };

  this.printSnake = function () {
    const chains = this.body;
    for (let idx = 0; idx < this.body.length; idx++) {
      rect(chains[idx].x, chains[idx].y, BLOCK, BLOCK);
    }
  };

  this.printFood = function () {
    rect(this.food.x, this.food.y, BLOCK, BLOCK);
  };
}

function draw() {
  background(50);
  snake.update();
  snake.eat();

  if (snake.isDead()) {
    alert(`Dead, you! \nScore: ${snake.foodCount}`);
    snake.init();
  }

  snake.printSnake();
  snake.printFood();
}
