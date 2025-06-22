// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const bgImg = new Image();
bgImg.src = "assets/bg.jpg";

const flapSound = new Audio("/assets/flap.mp3");
const hitSound = new Audio("/assets/hit.mp3");

// Bird object
let bird = {
  x: 80,
  y: 250,
  width: 40,
  height: 40,
  gravity: 0.6,
  lift: -10,
  velocity: 0,

  draw() {
    ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
  },

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Prevent falling through the ground
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.velocity = 0;
    }

    // Prevent flying above the screen
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
};

// Pipe class
class Pipe {
  constructor() {
    this.top = Math.random() * 200 + 50;
    this.bottom = canvas.height - this.top - 150;
    this.x = canvas.width;
    this.width = 60;
    this.speed = 2;
    this.scored = false;
  }

  draw() {
    // Draw top pipe (flipped vertically)
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.top);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -this.width / 2, 0, this.width, this.top);
    ctx.restore();

    // Draw bottom pipe
    ctx.drawImage(pipeImg, this.x, canvas.height - this.bottom, this.width, this.bottom);
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    return this.x + this.width < 0;
  }

  hits(b) {
    // Collision detection
    if (
      (b.y < this.top || b.y + b.height > canvas.height - this.bottom) &&
      b.x + b.width > this.x && b.x < this.x + this.width
    ) {
      return true;
    }
    return false;
  }
}

// Game state
let pipes = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let frames = 0;
let started = false;
let gameOver = false;

// Start or jump event
document.addEventListener("keydown", () => {
  if (!started) {
    document.getElementById("startScreen").style.display = "none";
    started = true;
    gameLoop();
  } else if (!gameOver) {
    bird.velocity = bird.lift;
    flapSound.play();
  } else {
    location.reload();
  }
});

// Draw score and high score
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("High Score: " + highScore, 20, 70);
}

// Main game loop
function gameLoop() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  bird.update();
  bird.draw();

  // Add new pipe
  if (frames % 90 === 0) {
    pipes.push(new Pipe());
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].draw();

    // Collision
    if (pipes[i].hits(bird)) {
      hitSound.play();
      gameOver = true;
    }

    // Score
    if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].scored) {
      score++;
      pipes[i].scored = true;
    }

    // Remove offscreen pipes
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  drawScore();

  if (!gameOver) {
    frames++;
    requestAnimationFrame(gameLoop);
  } else {
    // Save high score
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }

    // Show game over message
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("Game Over", 100, canvas.height / 2);
  }
}