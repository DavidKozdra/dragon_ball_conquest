import { Player } from './Player.js';
import { collides } from './GameObject.js';
import { charController } from './Charictar_controller.js';
import { AI } from './AI.js';
import { Fist } from './fist.js';
import { characters } from './characters.js';
import { add } from './utils.js';
import { SetUpClusters, drawClouds, checkBoundsClouds } from './clouds.js';

import { GameStateManager } from "./gameState.js"

import { UIManager } from "./UI_Manager.js"
import { initUI } from "./ui.js"

import { runGeneticAlgorithm, createRandomGenome } from './ga.js';

let headless = false

const GameStates = {
  MAIN_MENU: "mainMenu",
  PLAYING: "playing",
  INVENTORY: "inventory",
  VIEW_EDIT: "viewEdit",
  PAUSED: "paused",
  SETTINGS: "settings",
  GAMELOSE: "lose",
  GAMEWON: "won",
  CHAR_SELECT: "char_select"
};

let gameStateManager = new GameStateManager();
let uiManager = new UIManager();

var notificationManager;

let delta = 1;
let canvasWidth = 800;
let canvasHeight = 400;
let timerOValue = 25;
let timer = timerOValue;
let winner = '';
let gameEnded = false

let AIparams = {}

let player1, player2;
const AICombos = [
  { name: "MELEE_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "MELEE_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "MELEE_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "MELEE_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "MELEE_dashTimer", type: "continuous", min: -5, max: 5 },

  { name: "CHARGING_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "CHARGING_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "CHARGING_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "CHARGING_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "CHARGING_dashTimer", type: "continuous", min: -5, max: 5 },

  { name: "ATTACKING_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "ATTACKING_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "ATTACKING_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "ATTACKING_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "ATTACKING_dashTimer", type: "continuous", min: -5, max: 5 },

  { name: "DASHING_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "DASHING_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "DASHING_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "DASHING_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "DASHING_dashTimer", type: "continuous", min: -5, max: 5 },

  { name: "CIRCLING_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "CIRCLING_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "CIRCLING_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "CIRCLING_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "CIRCLING_dashTimer", type: "continuous", min: -5, max: 5 },

  { name: "IDLE_distanceToPlayer", type: "continuous", min: -5, max: 5 },
  { name: "IDLE_healthRatio", type: "continuous", min: -5, max: 5 },
  { name: "IDLE_kiRatio", type: "continuous", min: -5, max: 5 },
  { name: "IDLE_distanceToProjectile", type: "continuous", min: -5, max: 5 },
  { name: "IDLE_dashTimer", type: "continuous", min: -5, max: 5 }
];
let currentGenome = [-0.16943415730991926,0.26424323741331934,0.28499519599444273,-3.2260340703831503,-3.0082171969401132,1.9555752252938154,0.35042685536423485,1.6648539904601918,-2.763856064519005,-3.3860223552189392,-3.7753456537483228,-0.34082302306703177,0.4646492965309484,-3.2470351677856524,1.934743183467694,0.7177936934034023,0.09137450772918264,-1.6338871622840725,-2.274934431736818,-1.5716877868846544,-1.4176487740600552,1.480286124568698,0.8454998182012496,3.7520025537723836,1.947357736717016,2.8595598762587087,1.1722189703877852,1.6861600307978009,-2.8430473338271405,-1.0134929668052521]
const params = new URLSearchParams(window.location.search);
const game_id = params.get('game_id');


window.addEventListener('message', (event) => {
  if (event.data.type === 'newGenome' && event.data.game_id === game_id) {
    const { player1Genome, player2Genome } = event.data.data;
    gameEnded = false
    winner = null
    // console.log("Running new Genome for", game_id, player1Genome, player2Genome);
    startGame(player1Genome, player2Genome);
  }
});
// console.log("WTF?");
function setup() {

  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.id('game-canvas');
  gameStateManager.addState(GameStates.MAIN_MENU, {});
  gameStateManager.addState(GameStates.SETTINGS, {});
  gameStateManager.addState(GameStates.PLAYING, {});
  gameStateManager.addState(GameStates.INVENTORY, {});
  gameStateManager.addState(GameStates.PAUSED, {});
  gameStateManager.addState(GameStates.VIEW_EDIT, {});

  gameStateManager.addState(GameStates.GAMELOSE, {});

  gameStateManager.addState(GameStates.GAMEWON, {});

  gameStateManager.addState(GameStates.CHAR_SELECT, {});
  initUI(uiManager, gameStateManager, GameStates)
  gameStateManager.onChange((from, to) => uiManager.onGameStateChange(to));
  gameStateManager.setState(GameStates.MAIN_MENU);

  setInterval(() => {
    if (timer > 0 && gameStateManager.is(GameStates.PLAYING)) timer--;
  }, 1000);

  SetUpClusters();
}




function setWinner(player) {
  winner = player;
}

function startGame(player1Genome = currentGenome, player2Genome = currentGenome) {
  frameRate(1000)
  SetUpClusters()

  const savedTime = parseInt(localStorage.getItem('time_limit') ?? '60');
  timerOValue = savedTime === 0 ? Infinity : savedTime;
  timer = timerOValue;
  // console.log(selectedCharacters[0], selectedCharacters[1]);

  let team1 = selectedCharacters[0].map(charData => {
    let char = new charController(0, 200, charData.isControllable, charData.spirit, charData.name);
    char.fists = [new Fist(char)];
    return char;
  });

  let team2 = selectedCharacters[1].map(charData => {
    let char = new charController(700, 200, charData.isControllable, charData.spirit, charData.name);
    char.fists = [new Fist(char)];
    return char;
  });

  //{ left: 65, right: 68, up: 87, down: 83 },
  player1 = team1.some(char => char.isControllable)
    ? new Player(88, 67, { left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW }, 90, team1[0], team1)
    : new AI(selectedCharacters[0][0], team1, player1Genome);

  player2 = team2.some(char => char.isControllable)
    ? new Player(78, 66, { left: 65, right: 68, up: 87, down: 83 }, 77, team2[0], team2)
    : new AI(team2[0], team2, player2Genome);

  gameStateManager.setState(GameStates.PLAYING);

}

function resetGame() {
  console.log("restart")
  gameEnded = false
  winner = null
  startGame()

}

function drawHUD() {
  const PAD = 14;
  const BAR_W = 320;
  const BAR_Y = 30;
  const BAR_H = 14;
  const KI_Y = 50;
  const KI_H = 9;
  const cx = canvasWidth / 2;

  // HUD background strip
  fill(0, 0, 0, 170);
  noStroke();
  rect(0, 0, canvasWidth, 70);

  // --- Player 1 ---
  const p1 = player1.char;
  const p1HP = constrain(p1.health / p1.maxHealth, 0, 1);
  const p1Ki = constrain(p1.ki / p1.maxKi, 0, 1);

  // Name
  fill(220, 220, 220);
  noStroke();
  textSize(11);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text(p1.name.toUpperCase(), PAD, 9);
  textStyle(NORMAL);

  // Health bar track
  fill(25, 25, 25);
  rect(PAD, BAR_Y, BAR_W, BAR_H, 3);
  // Health bar fill — green → red as HP falls
  const p1hColor = lerpColor(color(220, 50, 50), color(50, 200, 80), p1HP);
  fill(p1hColor);
  rect(PAD, BAR_Y, BAR_W * p1HP, BAR_H, 3);

  // Ki bar track
  fill(15, 15, 40);
  rect(PAD, KI_Y, BAR_W, KI_H, 3);
  fill(45, 100, 230);
  rect(PAD, KI_Y, BAR_W * p1Ki, KI_H, 3);

  // --- Player 2 ---
  const p2 = player2.char;
  const p2HP = constrain(p2.health / p2.maxHealth, 0, 1);
  const p2Ki = constrain(p2.ki / p2.maxKi, 0, 1);
  const p2X = canvasWidth - PAD - BAR_W;

  // Name
  fill(220, 220, 220);
  textAlign(RIGHT, TOP);
  textStyle(BOLD);
  text(p2.name.toUpperCase(), canvasWidth - PAD, 9);
  textStyle(NORMAL);

  // Health bar track
  fill(25, 25, 25);
  rect(p2X, BAR_Y, BAR_W, BAR_H, 3);
  // Fill from the right
  const p2hColor = lerpColor(color(220, 50, 50), color(50, 200, 80), p2HP);
  fill(p2hColor);
  rect(p2X + BAR_W * (1 - p2HP), BAR_Y, BAR_W * p2HP, BAR_H, 3);

  // Ki bar track
  fill(15, 15, 40);
  rect(p2X, KI_Y, BAR_W, KI_H, 3);
  fill(220, 120, 20);
  rect(p2X + BAR_W * (1 - p2Ki), KI_Y, BAR_W * p2Ki, KI_H, 3);

  // --- Timer circle (center) ---
  const urgent = timer !== Infinity && timer <= 10;
  fill(0, 0, 0, 190);
  noStroke();
  circle(cx, 35, 52);
  stroke(urgent ? color(220, 50, 50) : color(80, 80, 80));
  strokeWeight(2);
  noFill();
  circle(cx, 35, 52);

  fill(urgent ? color(220, 50, 50) : color(240, 240, 240));
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  if (timer === Infinity) {
    textSize(22);
    text('∞', cx, 35);
  } else {
    textSize(20);
    text(timer, cx, 35);
  }
  textStyle(NORMAL);
}

function checkCollisions() {
  let allObjects = [...player1.char.projectiles, ...player2.char.projectiles, ...player1.char.fists, ...player2.char.fists, player1.char, player2.char];
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
  background(9, 9, 15); // always clear to match the CSS bg color

  uiManager.updateAll();
  if ((timer == 0 || gameEnded) && gameStateManager.is(GameStates.PLAYING)) {
    let player1Health = player1.team.reduce(add, 0);
    let player2Health = player2.team.reduce(add, 0);

    const p1wins = player1Health >= player2Health;
    if (p1wins) {
      gameStateManager.setState(GameStates.GAMEWON);
    } else {
      gameStateManager.setState(GameStates.GAMELOSE);
    }

    window.parent.postMessage({
      type: 'gameFinished',
      data: { player1Health: player1, player2Health: player2, id: game_id }
    }, '*');

    gameEnded = false;
    timer = timerOValue;
  }

  if (gameStateManager.is(GameStates.PLAYING)) {
    background(10, 100, 220); // This sets the background color each frame

    //drawClouds();
    player1.update();
    if (player1.char) {
      player1.char.update();

      if (!headless) player1.char.draw();
    } else {
      return;
    }

    player2.update();
    if (player2.char) {
      player2.char.update();
      if (!headless) player2.char.draw();
    } else {
      return;
    }

    if (!headless) {
      for (let i = 0; i < player1.char.projectiles.length; i++) {
        player1.char.projectiles[i].draw();
      }

      for (let i = 0; i < player2.char.projectiles.length; i++) {
        player2.char.projectiles[i].draw();
      }

      // Ground
      fill(30, 110, 40);
      noStroke();
      rect(0, 350, canvasWidth, 50);
      fill(20, 80, 30);
      rect(0, 350, canvasWidth, 6);

      // HUD
      drawHUD();

      checkCollisions();
    }
  }


  // Handle continuous movement
  if (gameStateManager.is(GameStates.PLAYING)) {
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
  if (keyIsPressed && keyCode === 13) {

    resetGame();
  }
}

function keyPressed() {
  if (keyCode === 32) { // Space bar for pause
    if (gameStateManager.is(GameStates.PAUSED)) {
      gameStateManager.setState(GameStates.PLAYING)
    } else if (gameStateManager.is(GameStates.PLAYING)) {
      gameStateManager.setState(GameStates.PAUSED)
    }
  }
  if (gameStateManager.is(GameStates.PAUSED)) return; // Skip updates if game is paused

  if (gameStateManager.is(GameStates.MAIN_MENU)) {

  } else if (gameStateManager.is(GameStates.CHAR_SELECT)) {
    return;
  } else if (gameStateManager.is(GameStates.PLAYING)) {
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
  if (gameStateManager.is(GameStates.PAUSED)) return; // Skip updates if game is paused

  if (gameStateManager.is(GameStates.MAIN_MENU) || gameStateManager.is(GameStates.CHAR_SELECT)) return;


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

  if (gameStateManager.is(GameStates.PLAYING)) {
    if (player1.char.isControllable) {
      player1.handleKeyUp(keyCode);
    }

    if (player2.char.isControllable) {
      console.log("key released");
      player2.handleKeyUp(keyCode);
    }
  }
}


export { setup, draw, keyPressed, keyReleased, resetGame, canvasWidth, canvasHeight, player1, player2, gameStateManager, GameStates, setWinner, startGame };



