import { Player } from './Player.js';
import { collides } from './GameObject.js';

let clouds = [];
let delta = 1;

const costOfFlying = 0.1;
const jumpForce = 5;
let canvasWidth = 400;
let canvasHeight = 400;
let timer = 120;
let gameState = 'main_menu';
let winner = '';

let player1, player2;
let lastUpPressTime = 0;

function setGameState(state) {
  gameState = state;
}

function setWinner(player) {
  winner = player;
}

let currentMenu = 0;
let menus = [
  {
    name: 'Network Multiplayer',
    image: 'net.png',
    onselect: () => {
      console.log('Network Multiplayer');
      gameState = 'net_playing';
    }
  },
  {
    name: 'Couch Multiplayer',
    image: 'couch.png',
    onselect: () => {
      console.log('Couch Multiplayer');
      gameState = 'playing';
    }
  },
  {
    name: 'Single Player',
    image: 'single.png',
    onselect: () => {
      console.log('Single Player');
      gameState = 'ai_playing';
    }
  }
];

let buttonNext, buttonPrevious, buttonSelect;

function onWindowResize() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(canvasWidth, canvasHeight);
  positionButtons();
}

function positionButtons() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();
  if (buttonNext) {
    buttonNext.position(rect.right - 60, rect.top + rect.height / 2 - 25);
  }
  if (buttonPrevious) {
    buttonPrevious.position(rect.left + 10, rect.top + rect.height / 2 - 25);
  }
  if (buttonSelect) {
    buttonSelect.position(rect.left + rect.width / 2 - 50, rect.bottom + 20);
  }
}

function RenderMainMenu() {
  // Show buttons
  background(200, 200, 220);
  fill(0);
  stroke(0)
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Dragon Ball Conquest', canvasWidth / 2, canvasHeight / 2 - 50);
  textSize(16);
  text('Use < and > to navigate, Enter to select', canvasWidth / 2, canvasHeight / 2);

  let menu = menus[currentMenu];
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(menu.name, canvasWidth / 2, canvasHeight / 2 + 50);
  // Placeholder for image
  rect(canvasWidth / 2 - 50, canvasHeight / 2 + 60, 100, 100);

// images 1 and 3 

rect(canvasWidth / 2 - 250, canvasHeight / 2 + 60, 80, 80);


rect(canvasWidth / 2 + 170, canvasHeight / 2 + 60, 80, 80);


  // Create navigation buttons if not already created
  if (!buttonNext) {
    buttonNext = createButton('>');
    buttonNext.class('game-button');
    buttonNext.size(50, 50);
    buttonNext.mousePressed(() => {
      currentMenu = (currentMenu + 1) % menus.length;
    });
  }

  if (!buttonPrevious) {
    buttonPrevious = createButton('<');
    buttonPrevious.class('game-button');
    buttonPrevious.size(50, 50);
    buttonPrevious.mousePressed(() => {
      currentMenu = (currentMenu - 1 + menus.length) % menus.length;
    });
  }

  buttonNext.show();
  buttonPrevious.show();
  positionButtons();
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.id('game-canvas');
  window.addEventListener('resize', onWindowResize);

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
  if (timer === 0) {
    setGameState('gameOver');
    setWinner(player1.health > player2.health ? 'Player 1' : 'Player 2');
  }

  if (gameState === 'paused') {
    fill(255);
    textSize(32);
    stroke(10);
    textAlign(CENTER, CENTER);
    text(`Paused!`, canvasWidth / 2, canvasHeight / 2);

    // back to main menu button
    if (!buttonSelect) {
      buttonSelect = createButton('Back to Main Menu');
      buttonSelect.class('game-button');
      buttonSelect.size(100, 50);
      buttonSelect.mousePressed(() => {
        setGameState('main_menu');
        buttonSelect.hide();
      });
    }

    buttonSelect.show();
    positionButtons();
    return;
  }

  if (gameState === 'main_menu') {
    RenderMainMenu();
    return;
  } else {
    buttonNext.hide();
    buttonPrevious.hide();
  }

  if (gameState === 'playing') {
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
    rect(0, 350, canvasWidth, 50);

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
  }

  if (gameState === 'gameOver') {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`${winner} Wins!`, canvasWidth / 2, canvasHeight / 2);

    textSize(16);
    text('Press enter to restart', canvasWidth / 2, canvasHeight / 2 + 30);

    if (keyIsPressed && keyCode === 13) {
      resetGame();
    }
  }
}

let lastUpPressTimePlayer1 = 0;
let lastUpPressTimePlayer2 = 0;

function keyPressed() {
  if (keyCode === 32) { // Space bar for pause
    if (gameState === 'paused') {
      gameState = 'playing';
    } else if (gameState === 'playing') {
      gameState = 'paused';
    }
  }
  if (gameState === 'paused') return; // Skip updates if game is paused

  if (gameState === 'main_menu') {
    if (keyCode === RIGHT_ARROW) {
      currentMenu = (currentMenu + 1) % menus.length;
      RenderMainMenu();
    } else if (keyCode === LEFT_ARROW) {
      currentMenu = (currentMenu - 1 + menus.length) % menus.length;
      RenderMainMenu();
    } else if (keyCode === ENTER) {
      menus[currentMenu].onselect();
    }
    return;
  }

  if (gameState === "playing") {
    const currentTime = millis();

    player1.handleKeyPress(keyCode);
    player2.handleKeyPress(keyCode);

    // Handle player 1 jump and fly toggle
    if (keyCode === player1.moveKeys.up) {
      if (currentTime - lastUpPressTimePlayer1 < 300) { // 300 ms for double press detection
        player1.toggleFlying();
      } else {
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

export { setup, draw, keyPressed, keyReleased, resetGame, canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner };
