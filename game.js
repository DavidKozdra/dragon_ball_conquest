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

function setup() {
  const moveKeysPlayer1 = { left: 65, right: 68, up: 87, down: 83 }; // 'A', 'D', 'W', 'S' keys
  const moveKeysPlayer2 = { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW }; // Arrow keys

  player1 = new Player(0, 200, 88, 67, moveKeysPlayer1); // 'X' and 'C' keys
  player2 = new Player(300, 200, 78, 66, moveKeysPlayer2); // 'N' and 'B' keys

  createCanvas(canvasWidth, canvasHeight);
  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  setInterval(() => {
    if (timer > 0 && gameState === 'playing') timer--;
  }, 1000);
}


function setGameState(state) {
  gameState = state;
}

function setWinner(player) {
  winner = player;
}

function resetGame() {
  player1 = new Player(0, 200, 88, 67);
  player2 = new Player(300, 200, 78, 66);
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
  let allObjects = [...player1.projectiles, ...player2.projectiles, player1, player2];
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
  background(10, 100, 220); // This sets the background color each frame
  
  fill(255);
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x += random(0, 0.5); // Adjusting cloud speed
    ellipse(clouds[i].x, clouds[i].y, 80, 40);
  }
  console.log(player1.projectiles.length)
  for (let i = 0; i < player1.projectiles.length; i++) {
    console.log(player1.projectiles[i])
    player1.projectiles[i].draw();
  }

  for (let i = 0; i < player2.projectiles.length; i++) {
    player2.projectiles[i].draw();
  }

  player1.update();
  player1.draw();

  player2.update();
  player2.draw();
  
  //ground
  fill(0, 100, 0);
  rect(0, 350, 400, 50);
  
  //UI
  //player1 health
  fill(10, 10, 10);
  rect(0, 20, player1.maxHealth, 10);
  fill(200, 0, 0);
  rect(0, 20, player1.health, 10);

  //player1 ki 
  fill(10, 10, 10);
  rect(0, 50, player1.maxKi, 10);
  fill(10, 0, 200);
  rect(0, 50, player1.ki, 10);

  //player2 health
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxHealth, 20, player2.maxHealth, 10);
  fill(200, 0, 0);
  rect(canvasWidth - player2.health, 20, player2.health, 10);

  //player2 ki
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxKi, 50, player2.maxKi, 10);
  fill(10, 0, 200);
  rect(canvasWidth - player2.ki, 50, player2.ki, 10);

  // Timer
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(timer, canvasWidth / 2, 30);

  restartClouds();

  checkCollisions();

  if (gameState === 'gameOver') {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`${winner} Wins!`, canvasWidth / 2, canvasHeight / 2);
  }
}

function keyPressed() {
  const currentTime = millis();
  if (keyCode === player1.moveKeys.up) {
    if (currentTime - lastUpPressTime < 300) { // 300 ms for double press detection
      player1.toggleFlying();
    } else {
      player1.jump(); // Single press to jump
    }
    lastUpPressTime = currentTime;
  } else if (keyCode === player2.moveKeys.up) {
    if (currentTime - lastUpPressTime < 300) { // 300 ms for double press detection
      player2.toggleFlying();
    } else {
      player2.jump(); // Single press to jump
    }
    lastUpPressTime = currentTime;
  }
}

export { setup, draw, keyPressed, resetGame, canvasWidth, canvasHeight, player1, player2,gameState,setGameState,winner, setWinner};