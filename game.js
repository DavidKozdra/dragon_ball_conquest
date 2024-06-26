import { Player } from './Player.js';
import { collides } from './GameObject.js';
import { charController } from './Charictar_controller.js';
import {AI} from './AI.js';

let clouds = [];
let delta = 1;

let canvasWidth = 400;
let canvasHeight = 400;

let timerOValue = 120
let timer = timerOValue;
let gameState = 'main_menu';
let winner = '';

let player1, player2;

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

      // set up player 1 and 2 with character controllers 
      let char1 = new charController(0, 200,true);
      let char2 = new charController(300, 200, true,[100,0,2]);

      let char3 = new charController(300, 200, true,[100,0,2]);

      let team = [char1, char2];

      player1 = new Player(88,67 , { left: 65, right: 68, up: 87, down: 83 }, 90, char1, team=[char1]);
      player2 = new Player(78,66 , { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW }, 77, char2, team=[char2,char3]);
    }
  },
  {
    name: 'Single Player',
    image: 'single.png',
    onselect: () => {
      console.log('Single Player');
      gameState = 'playing';

      // set up player 1 and 2 with character controllers
      let char1 = new charController(0, 200);
      let char2 = new charController(300, 200, false, [100,0,2]);
      let char3 = new charController(300, 200, false, [10,0,200]);

      let char4 = new charController(300, 200, false, [10,100,100]);

      player1 = new Player(88, 67, { left: 65, right: 68, up: 87, down: 83 }, 90, char1,[char1]);
      player2 = new AI( char2, [char2,char3, char4]);

      console.log("?????????//")

    }
  }
];

let buttonNext, buttonPrevious, buttonSelect;

function onWindowResize() {
  //canvasWidth = window.innerWidth;
  //canvasHeight = window.innerHeight;
  //resizeCanvas(canvasWidth, canvasHeight);
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
  stroke(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Dragon Ball Conquest', canvasWidth / 2, canvasHeight / 2 - 50);
  textSize(16);
  //text('Use < and > to navigate, Enter to select', canvasWidth / 2, canvasHeight / 2);

  let menu = menus[currentMenu];
  fill(0);
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
  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  setInterval(() => {
    if (timer > 0 && gameState === 'playing') timer--;
  }, 1000);
}

function resetGame() {

  clouds = [];
  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  winner = '';
  timer = timerOValue
  menus[currentMenu].onselect();
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

function add(total, num){
  print(num)
  return total + num
}

function draw() {
  if (timer === 0) {
    setGameState('gameOver');
   // the winner is set by player team health total
   winner = () => {
    let player1Health = player1.team.reduce(add, 0)
    let player2Health = player2.team.reduce(add,0)
    console.log(player1Health, player2Health )
    return player1Health > player2Health
   }

    setWinner( winner()? 'Player 1' : 'Player 2');
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



    player1.update();
    if(player1.char) {

      player1.char.update();
      player1.char.draw();
  
    }else {
      return
    }

    player2.update();
    if(player2.char) {
      player2.char.update();
      player2.char.draw();
  }else {
    return
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
    textSize(16);
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text('Player 1', 0, 10);
    textAlign(RIGHT, CENTER);
    text('Player 2', canvasWidth, 10);

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
    fill(10, 0, 200);
    rect(canvasWidth - player2.char.ki, 50, player2.char.ki, 10);

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
      console.log("reset")
      resetGame();
    }
    console.log(gameState)
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
      buttonSelect.hide();
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
  } else if (gameState === 'playing') {
    if(player1.char.isControllable)
      {
      player1.handleKeyDown(keyCode);
      player1.handleKeyPress(keyCode);
      }

      if (player2.char.isControllable)
      {
      player2.handleKeyDown(keyCode);
      player2.handleKeyPress(keyCode);
      }

  }
}

function keyReleased() {

  if (gameState === 'paused') return; // Skip updates if game is paused

  if (gameState === 'main_menu') return;

  if (player1.char.isControllable)
  {
  if (keyCode === player1.moveKeys.up) {
    player1.char.stopJump();
  }
}

  if (player2.char.isControllable)
    {
      if (keyCode === player2.moveKeys.up) {
        player2.char.stopJump();
      }

    }

  if (gameState === 'playing') {
    if (player1.char.isControllable)
    {
      player1.handleKeyUp(keyCode);
    }

    if (player2.char.isControllable)
    {
      console.log("key released")
      player2.handleKeyUp(keyCode);
    }
  }
}

export { setup, draw, keyPressed, keyReleased, resetGame, canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner };
