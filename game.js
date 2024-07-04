import { Player } from './Player.js';
import { collides } from './GameObject.js';
import { charController } from './Charictar_controller.js';
import { AI } from './AI.js';
import { Fist } from './fist.js';
import { characters } from './characters.js';
import { add } from './utils.js';
import { UpdateUI, RenderMainMenu, RenderCharacterSelector, positionButtons, menus, currentMenu, selectedCharacters, onWindowResize, initializeButtons } from './ui.js';
import { SetUpClusters, drawClouds, checkBoundsClouds } from './clouds.js';

let delta = 1;
let canvasWidth = 400;
let canvasHeight = 400;
let timerOValue = 120;
let timer = timerOValue;
let gameState = 'main_menu';
let winner = '';

let player1, player2;

function setGameState(state) {
  gameState = state;
}

function getGameState() {
  return gameState;
}

function setWinner(player) {
  winner = player;
}

function startGame() {
  gameState = 'playing';
  SetUpClusters()

  console.log(selectedCharacters[0], selectedCharacters[1]);

  let team1 = selectedCharacters[0].map(charData => {
    let char = new charController(0, 200, charData.isControllable, charData.spirit, charData.name);
    char.fists = [new Fist(char, 5, 5)];
    return char;
  });

  let team2 = selectedCharacters[1].map(charData => {
    let char = new charController(300, 200, charData.isControllable, charData.spirit, charData.name);
    char.fists = [new Fist(char, 5, 5)];
    return char;
  });

  //{ left: 65, right: 68, up: 87, down: 83 },
  player1 = team1.some(char => char.isControllable) 
    ? new Player(88, 67,  { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW },90, team1[0], team1) 
    : new AI(selectedCharacters[0][0], team1);

  player2 = team2.some(char => char.isControllable) 
    ? new Player(78, 66, { left: 65, right: 68, up: 87, down: 83 } , 77, team2[0], team2) 
    : new AI(team2[0], team2);

  console.log("Player1:", player1);
  console.log("Player2:", player2);
}

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.id('game-canvas');
  window.addEventListener('resize', onWindowResize);

  setInterval(() => {
    if (timer > 0 && gameState === 'playing') timer--;
  }, 1000);

  initializeButtons();  
  SetUpClusters();
}

function resetGame() {
  SetUpClusters();
  winner = '';
  timer = timerOValue;
  menus[currentMenu].onselect();
}

function checkCollisions() {
  let allObjects = [...player1.char.projectiles, ...player2.char.projectiles, ...player1.char.fists, ...player2.char.fists, player1.char, player2.char];
  for (let i = 0; i < allObjects.length; i++) {
    for (let j = i + 1; j < allObjects.length; j++) {
      if (collides(allObjects[i], allObjects[j])) {
        console.log('collision');
        allObjects[i].onCollision(allObjects[j]);
        allObjects[j].onCollision(allObjects[i]);
      }
    }
  }
}

function draw() {
  UpdateUI();
  if (timer === 0) {
    setGameState('gameOver');
    winner = () => {
      let player1Health = player1.team.reduce(add, 0);
      let player2Health = player2.team.reduce(add, 0);
      console.log(player1Health, player2Health);
      return player1Health > player2Health;
    };

    setWinner(winner() ? 'Player 1' : 'Player 2');
  }

  if (gameState === 'paused') {
    fill(255);
    textSize(32);
    stroke(10);
    textAlign(CENTER, CENTER);
    text(`Paused!`, canvasWidth / 2, canvasHeight / 2);
    positionButtons();
    return;
  }

  if (gameState === 'main_menu') {
    RenderMainMenu();
    return;
  } else if (gameState === 'char_select') {
    RenderCharacterSelector();
    return;
  } 

  if (gameState === 'playing') {
    background(10, 100, 220); // This sets the background color each frame

    drawClouds();
    player1.update();
    if (player1.char) {
      player1.char.update();
      player1.char.draw();
    } else {
      return;
    }

    player2.update();
    if (player2.char) {
      player2.char.update();
      player2.char.draw();
    } else {
      return;
    }

    for (let i = 0; i < player1.char.projectiles.length; i++) {
      player1.char.projectiles[i].draw();
    }

    for (let i = 0; i < player2.char.projectiles.length; i++) {
      player2.char.projectiles[i].draw();
    }

    // Ground
    fill(0, 100, 0);
    rect(0, 350, canvasWidth, 50);

    // UI
    fill(0);
    rect(0, 0, 100, 40);
    textSize(16);
    fill(255);
    noStroke();
    textAlign(LEFT, CENTER);
    text('Player 1', 20, 20);

    fill(0);
    rect(canvasWidth - 100, 0, 100, 40);
    textAlign(RIGHT, CENTER);
    fill(255);
    text('Player 2', canvasWidth - 20, 20);

    // Player1 health
    fill(10, 10, 10);
    rect(0, 30, player1.char.maxHealth, 10);
    fill(200, 0, 0);
    rect(0, 30, player1.char.health, 10);

    // Player1 ki
    fill(10, 10, 10);
    rect(0, 50, player1.char.maxKi, 10);
    fill(10, 0, 200);
    rect(0, 50, player1.char.ki, 10);

    // Player2 health
    fill(10, 10, 10);
    rect(canvasWidth - player2.char.maxHealth, 30, player2.char.maxHealth, 10);
    fill(200, 0, 0);
    rect(canvasWidth - player2.char.health, 30, player2.char.health, 10);

    // Player2 ki
    fill(10, 10, 10);
    rect(canvasWidth - player2.char.maxKi, 50, player2.char.maxKi, 10);
    fill(10, 0, 255);
    rect(canvasWidth - player2.char.ki, 50, player2.char.ki, 10);

    // Timer
    fill(255);
    stroke(0);
    strokeWeight(2);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(timer, canvasWidth / 2, 50);

    checkBoundsClouds();
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
      console.log("reset");
      resetGame();
    }
    console.log(gameState);
  }

  // Handle continuous movement
  if (gameState === 'playing') {
    if (player1.char.isControllable) {
      if (keyIsDown(player1.moveKeys.left)) player1.char.applyMovement('left');
      if (keyIsDown(player1.moveKeys.right)) player1.char.applyMovement('right');
      if (keyIsDown(player1.moveKeys.up)) player1.char.applyMovement('up');
      if (keyIsDown(player1.moveKeys.down)) player1.char.applyMovement('down');
      if (keyIsDown(player1.attackKey)) player1.char.applyAttacking();
      if (keyIsDown(player1.chargeKey)) player1.char.applyCharging();
      if (keyIsDown(player1.meleeKey)) player1.char.applyMelee();
    }

    if (player2.char.isControllable) {
      if (keyIsDown(player2.moveKeys.left)) player2.char.applyMovement('left');
      if (keyIsDown(player2.moveKeys.right)) player2.char.applyMovement('right');
      if (keyIsDown(player2.moveKeys.up)) player2.char.applyMovement('up');
      if (keyIsDown(player2.moveKeys.down)) player2.char.applyMovement('down');
      if (keyIsDown(player2.attackKey)) player2.char.applyAttacking();
      if (keyIsDown(player2.chargeKey)) player2.char.applyCharging();
      if (keyIsDown(player2.meleeKey)) player2.char.applyMelee();
    }
  }
}

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
  } else if (gameState === 'char_select') {
    return;
  } else if (gameState === 'playing') {
    if (player1.char.isControllable) {
      player1.handleKeyDown(keyCode);
      player1.handleKeyPress(keyCode);
    }

    if (player2.char.isControllable) {
      player2.handleKeyDown(keyCode);
      player2.handleKeyPress(keyCode);
    }
  }
}

function keyReleased() {
  if (gameState === 'paused') return; // Skip updates if game is paused

  if (gameState === 'main_menu') return;

  if (player1.char.isControllable) {
    if (keyCode === player1.moveKeys.up) {
      player1.char.stopJump();
    }
  }

  if (player2.char.isControllable) {
    if (keyCode === player2.moveKeys.up) {
      player2.char.stopJump();
    }
  }

  if (gameState === 'playing') {
    if (player1.char.isControllable) {
      player1.handleKeyUp(keyCode);
    }

    if (player2.char.isControllable) {
      console.log("key released");
      player2.handleKeyUp(keyCode);
    }
  }
}

export { setup, draw, keyPressed, keyReleased, resetGame, canvasWidth, canvasHeight, player1, player2, gameState, setGameState, getGameState, setWinner, startGame };
