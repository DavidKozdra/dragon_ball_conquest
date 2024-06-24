import { Player } from './Player.js';
import { collides } from './GameObject.js';

let clouds = [];
let delta = 1;

const costOfFlying = 0.1;
const jumpForce = 5;
const canvasWidth = 400;
const canvasHeight = 400;
let timer = 120;
let gameState = 'playing';
let winner = '';

let player1, player2;
let lastUpPressTime = 0;

function setGameState(state) {
  gameState = state;
}

function setWinner(player) {
  winner = player;
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  const moveKeysPlayer1 = { left: 65, right: 68, up: 87, down: 83 }; // 'A', 'D', 'W', 'S' keys
  const moveKeysPlayer2 = { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW }; // Arrow keys

  player1 = new Player(0, 200, 88, 67, moveKeysPlayer1, 90); // 'X', 'C', and 'Z' keys
  player2 = new Player(300, 200, 78, 66, moveKeysPlayer2, 77); // 'N', 'B', and 'M' keys

  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  setInterval(() => {
    if (timer > 0 && gameState === 'playing') timer--;
  }, 1000);
}

function resetGame() {
  const moveKeysPlayer1 = { left: 65, right: 68, up: 87, down: 83 }; // 'A', 'D', 'W', 'S' keys
  const moveKeysPlayer2 = { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW }; // Arrow keys

  player1 = new Player(0, 200, 88, 67, moveKeysPlayer1, 90);
  player2 = new Player(300, 200, 78, 66, moveKeysPlayer2, 77);
  timer = 120;
  clouds = [];
  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  gameState = 'playing';
  winner = '';
}

function restartClouds() {
  for (let i = 0; i < clouds.length; i++) {
    if (clouds[i].x + delta > 600) {
      clouds[i].x = random(-70, 5);
      clouds[i].y = random(-2, 300);
    }
  }
}

function checkCollisions() {
  let allObjects = [...player1.projectiles, ...player2.projectiles, ...player1.fists, ...player2.fists, player1, player2];
  for (let i = 0; i < allObjects.length; i++) {
    for (let j = i + 1; j < allObjects.length; j++) {
      if (collides(allObjects[i], allObjects[j])) {
        allObjects[i].onCollision(allObjects[j]);
        allObjects[j].onCollision(allObjects[i]);
      }
    }
  }
}
function draw() {
  if (gameState === 'paused') {
    fill(255);
    textSize(32); 
    stroke(10);
    textAlign(CENTER, CENTER);
    text(`Paused!`, canvasWidth / 2, canvasHeight / 2);
    return;
  }
  
  background(10, 100, 220); // This sets the background color each frame
  
  fill(255);
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x += random(0, 0.5); // Adjusting cloud speed
    ellipse(clouds[i].x, clouds[i].y, 80, 40);
  }

  for (let i = 0; i < player1.projectiles.length; i++) {
    player1.projectiles[i].draw();
  }

  for (let i = 0; i < player2.projectiles.length; i++) {
    player2.projectiles[i].draw();
  }

  player1.update();
  player1.draw();

  player2.update();
  player2.draw();
  
  // Ground
  fill(0, 100, 0);
  rect(0, 350, 400, 50);
  
  // UI
  textSize(16);
  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  text('Player 1', 0, 10);
  textAlign(RIGHT, CENTER);
  text('Player 2', canvasWidth, 10);
  
  // Player1 health
  fill(10, 10, 10);
  rect(0, 30, player1.maxHealth, 10);
  fill(200, 0, 0);
  rect(0, 30, player1.health, 10);

  // Player1 ki 
  fill(10, 10, 10);
  rect(0, 50, player1.maxKi, 10);
  fill(10, 0, 200);
  rect(0, 50, player1.ki, 10);

  // Player2 health
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxHealth, 30, player2.maxHealth, 10);
  fill(200, 0, 0);
  rect(canvasWidth - player2.health, 30, player2.health, 10);

  // Player2 ki
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxKi, 50, player2.maxKi, 10);
  fill(10, 0, 200);
  rect(canvasWidth - player2.ki, 50, player2.ki, 10);

  // Timer
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(timer, canvasWidth / 2, 50);

  restartClouds();

  checkCollisions();

  if (gameState === 'gameOver') {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`${winner} Wins!`, canvasWidth / 2, canvasHeight / 2);

    textSize(16);
    text('Press enter to restart', canvasWidth / 2, canvasHeight / 2 + 30);

    if (keyIsPressed && keyCode === 13) {
      resetGame()
    }
  }
}

let lastUpPressTimePlayer1 = 0;
let lastUpPressTimePlayer2 = 0;

function keyPressed() {
  const currentTime = millis();

  player1.handleKeyPress(keyCode);
  player2.handleKeyPress(keyCode);

  // Handle player 1 jump and fly toggle
  if (keyCode === player1.moveKeys.up) {
    if (currentTime - lastUpPressTimePlayer1 < 300) { // 300 ms for double press detection
      console.log("flying")
      player1.toggleFlying();
    } else {
      console.log("start")
      player1.startJump(); // Single press to jump
    }
    lastUpPressTimePlayer1 = currentTime;
  }

  // Handle player 2 jump and fly toggle
  if (keyCode === player2.moveKeys.up) {
    if (currentTime - lastUpPressTimePlayer2 < 300) { // 300 ms for double press detection
      player2.toggleFlying();
    } else {
      player2.startJump(); // Single press to jump
    }
    lastUpPressTimePlayer2 = currentTime;
  }

  // Handle game pause
  if (keyCode === 32) { // Space bar for pause
    if (gameState === 'paused') {
      gameState = 'playing';
    } else {
      gameState = 'paused';
    }
  }
}


function keyReleased() {
  if (keyCode === player1.moveKeys.up) {
    player1.isJumping = false;
  }

  if (keyCode === player2.moveKeys.up) {
    player2.isJumping = false;
  }
}

export { setup, draw, keyPressed,keyReleased, resetGame, canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner };
