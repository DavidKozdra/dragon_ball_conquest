import { Player } from './Player.js';
import { collides } from './GameObject.js';
import { charController } from './Charictar_controller.js';
import { AI } from './AI.js';
import { Fist } from './fist.js';
import { characters } from './characters.js';
import { add } from './utils.js';
import { SetUpClusters, drawClouds, checkBoundsClouds } from './clouds.js';

import {GameStateManager} from "./gameState.js"
import {UIManager} from "./UI_Manager.js"
import {initUI} from "./ui.js"

const GameStates = {
  MAIN_MENU: "mainMenu",
  PLAYING: "playing",
  INVENTORY: "inventory",
  VIEW_EDIT: "viewEdit",
  PAUSED: "paused",
  SETTINGS: "settings",
  GAMELOSE : "lose",
  GAMEWON:"won",
  CHAR_SELECT:"char_select"
};

let gameStateManager = new GameStateManager();
let uiManager = new UIManager();

const FIGHTS_COUNT = 100;
const GRID_COLS = 10;
const GRID_ROWS = 10;
const FIGHT_WIDTH = 80;
const FIGHT_HEIGHT = 80;

let delta = 1;
let canvasWidth = GRID_COLS * FIGHT_WIDTH;
let canvasHeight = GRID_ROWS * FIGHT_HEIGHT;
let timerOValue = 120;
let timer = timerOValue;
let gameState = 'main_menu';
let winner = '';

// Array to hold all fight instances
let fights = [];
let completedFights = 0;
let results = { team1Wins: 0, team2Wins: 0, draws: 0 };

// Fight class to encapsulate each individual fight
// Updated Fight class to work with the fixed Playing_Agent

class Fight {
  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.timer = timerOValue;
    this.player1 = null;
    this.player2 = null;
    this.isComplete = false;
    this.winner = null;
    this.scale = 0.2;
  }

  initialize(team1Template, team2Template) {
    // Create scaled-down teams for this fight
    let team1 = team1Template.map(charData => {
      let char = new charController(
        this.x + 10 * this.scale, 
        this.y + (this.height - 20) * this.scale, 
        charData.isControllable, 
        charData.spirit, 
        charData.name
      );
      char.fists = [new Fist(char, 5 * this.scale, 5 * this.scale)];
      char.scale = this.scale;
      char.speed *= this.scale;
      return char;
    });

    let team2 = team2Template.map(charData => {
      let char = new charController(
        this.x + (this.width - 20) * this.scale, 
        this.y + (this.height - 20) * this.scale, 
        charData.isControllable, 
        charData.spirit, 
        charData.name
      );
      char.fists = [new Fist(char, 5 * this.scale, 5 * this.scale)];
      char.scale = this.scale;
      char.speed *= this.scale;
      return char;
    });

    // Create players with game context
    this.player1 = new AI(team1[0], team1);
    this.player2 = new AI(team2[0], team2);

    // If using Playing_Agent instead of AI:
    // this.player1 = new Playing_Agent(team1[0], team1, this);
    // this.player2 = new Playing_Agent(team2[0], team2, this);
    
    // Set opponents
    if (this.player1.setOpponent) this.player1.setOpponent(this.player2);
    if (this.player2.setOpponent) this.player2.setOpponent(this.player1);
  }

  // Called when a player is defeated
  onPlayerDefeat(player) {
    if (player === this.player1) {
      this.winner = 'team2';
    } else if (player === this.player2) {
      this.winner = 'team1';
    }
    this.endFight();
  }

  update() {
    if (this.isComplete) return;

    // Update timer
    if (this.timer > 0) {
      this.timer -= 0.016;
    }

    // Check for timer end
    if (this.timer <= 0 && !this.isComplete) {
      this.endFight();
      return;
    }

    // Update players
    if (this.player1 && this.player1.char) {
      this.player1.update();
      this.player1.char.update();
      
      // Update projectile targets for player1
      if (this.player1.char.projectiles) {
        for (let projectile of this.player1.char.projectiles) {
          if (projectile.setTargets) {
            projectile.setTargets([this.player2]);
          }
        }
      }
      
      // Constrain to fight bounds
      this.player1.char.x = constrain(this.player1.char.x, this.x, this.x + this.width - 10);
      this.player1.char.y = constrain(this.player1.char.y, this.y, this.y + this.height - 10);

      // Check if player1 is defeated
      if (this.player1.isDefeated) {
        this.winner = 'team2';
        this.endFight();
        return;
      }
    }

    if (this.player2 && this.player2.char) {
      this.player2.update();
      this.player2.char.update();
      
      // Update projectile targets for player2
      if (this.player2.char.projectiles) {
        for (let projectile of this.player2.char.projectiles) {
          if (projectile.setTargets) {
            projectile.setTargets([this.player1]);
          }
        }
      }
      
      // Constrain to fight bounds
      this.player2.char.x = constrain(this.player2.char.x, this.x, this.x + this.width - 10);
      this.player2.char.y = constrain(this.player2.char.y, this.y, this.y + this.height - 10);

      // Check if player2 is defeated
      if (this.player2.isDefeated) {
        this.winner = 'team1';
        this.endFight();
        return;
      }
    }

    // Check collisions within this fight
    this.checkCollisions();

    // Alternative defeat check by health
    if (this.player1.char && this.player1.char.health <= 0 && !this.player1.isDefeated) {
      this.winner = 'team2';
      this.endFight();
    } else if (this.player2.char && this.player2.char.health <= 0 && !this.player2.isDefeated) {
      this.winner = 'team1';
      this.endFight();
    }
  }

  // ... rest of the Fight class methods remain the same ...
}

// For the main game system, create a game context:
const mainGameContext = {
  gameStateManager: gameStateManager,
  GameStates: GameStates,
  setWinner: setWinner,
  isPlayer1: (player) => player === player1,
  onPlayerDefeat: null // Not needed for main game
};

// When creating players in the main game:
// player1 = new Playing_Agent(team1[0], team1, mainGameContext);
// player2 = new Playing_Agent(team2[0], team2, mainGameContext);

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
  
  initUI(uiManager, gameStateManager, GameStates);
  gameStateManager.onChange((from, to) => uiManager.onGameStateChange(to));
  gameStateManager.setState(GameStates.MAIN_MENU);

  SetUpClusters();
}

function setGameState(state) {
  gameState = state;
}

function getGameState() {
  return gameState;
}

function setWinner(player) {
  winner = player;
}

function startMassSimulation(team1Template, team2Template) {
  // Reset everything
  fights = [];
  completedFights = 0;
  results = { team1Wins: 0, team2Wins: 0, draws: 0 };
  timer = timerOValue;

  // Create fight grid
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      let fightId = row * GRID_COLS + col;
      if (fightId >= FIGHTS_COUNT) break;
      
      let x = col * FIGHT_WIDTH;
      let y = row * FIGHT_HEIGHT;
      
      let fight = new Fight(fightId, x, y, FIGHT_WIDTH, FIGHT_HEIGHT);
      fight.initialize(team1Template, team2Template);
      fights.push(fight);
    }
  }

  gameStateManager.setState(GameStates.PLAYING);
  console.log(`Started ${fights.length} simultaneous fights!`);
}

function startGame() {
  // Use the existing selectedCharacters for mass simulation
  startMassSimulation(selectedCharacters[0], selectedCharacters[1]);
}

function resetGame() {
  SetUpClusters();
  winner = '';
  timer = timerOValue;
  fights = [];
  completedFights = 0;
  results = { team1Wins: 0, team2Wins: 0, draws: 0 };
}

function draw() {
  uiManager.updateAll();
  
  if (gameStateManager.is(GameStates.PLAYING)) {
    background(50, 150, 255);

    // Update all fights
    for (let fight of fights) {
      fight.update();
    }

    // Draw all fights
    for (let fight of fights) {
      fight.draw();
    }

    // Draw overall statistics
    fill(0);
    rect(0, canvasHeight - 60, canvasWidth, 60);
    
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(16);
    text(`Completed: ${completedFights}/${fights.length}`, 10, canvasHeight - 45);
    text(`Team 1 Wins: ${results.team1Wins}`, 10, canvasHeight - 25);
    text(`Team 2 Wins: ${results.team2Wins}`, 150, canvasHeight - 25);
    text(`Draws: ${results.draws}`, 290, canvasHeight - 25);

    // Calculate win percentage
    if (completedFights > 0) {
      let team1Percentage = ((results.team1Wins / completedFights) * 100).toFixed(1);
      let team2Percentage = ((results.team2Wins / completedFights) * 100).toFixed(1);
      
      textAlign(RIGHT, CENTER);
      text(`Team 1: ${team1Percentage}%`, canvasWidth - 150, canvasHeight - 45);
      text(`Team 2: ${team2Percentage}%`, canvasWidth - 10, canvasHeight - 45);
    }

    // Check if all fights are complete
    if (completedFights >= fights.length) {
      fill(255, 255, 0);
      textAlign(CENTER, CENTER);
      textSize(24);
      text("ALL FIGHTS COMPLETE!", canvasWidth / 2, canvasHeight / 2);
      
      textSize(16);
      if (results.team1Wins > results.team2Wins) {
        text("TEAM 1 WINS OVERALL!", canvasWidth / 2, canvasHeight / 2 + 30);
      } else if (results.team2Wins > results.team1Wins) {
        text("TEAM 2 WINS OVERALL!", canvasWidth / 2, canvasHeight / 2 + 30);
      } else {
        text("OVERALL TIE!", canvasWidth / 2, canvasHeight / 2 + 30);
      }
      
      text('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 50);
    }
  }

  if (gameStateManager.is(GameStates.GAMELOSE) || gameStateManager.is(GameStates.GAMEWON)) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Mass Simulation Complete!', canvasWidth / 2, canvasHeight / 2);

    textSize(16);
    text('Press enter to restart', canvasWidth / 2, canvasHeight / 2 + 30);

    if (keyIsPressed && keyCode === 13) {
      console.log("reset");
      resetGame();
      gameStateManager.setState(GameStates.MAIN_MENU);
    }
  }
}

function keyPressed() {
  if (keyCode === 32) { // Space bar for pause
    if (gameStateManager.is(GameStates.PAUSED)) {
      gameStateManager.setState(GameStates.PLAYING);
    } else if (gameStateManager.is(GameStates.PLAYING)) {
      gameStateManager.setState(GameStates.PAUSED);
    }
  }

  // R key to restart simulation
  if (keyCode === 82 && completedFights >= fights.length) { // R key
    resetGame();
    gameStateManager.setState(GameStates.MAIN_MENU);
  }

  if (gameStateManager.is(GameStates.PAUSED)) return;
}

function keyReleased() {
  // No continuous input needed for mass simulation
}

export { 
  setup, 
  draw, 
  keyPressed, 
  keyReleased, 
  resetGame, 
  canvasWidth, 
  canvasHeight, 
  gameState, 
  gameStateManager, 
  GameStates, 
  setWinner, 
  startGame, 
  startMassSimulation,
  fights,
  results,
};