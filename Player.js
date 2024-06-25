import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';

class Player {
  constructor(attackKey, chargeKey, moveKeys, meleeKey,charictarController) {
    this.attackKey = attackKey;
    this.chargeKey = chargeKey;
    this.meleeKey = meleeKey;
    this.moveKeys = moveKeys; // Object containing move keys
    this.controllable = false
    this.char = charictarController
    this.keyPressTimes = {};
    this.doubleTapThreshold = 300; // Threshold in milliseconds
    this.team = [];
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = constrain(value, 0, this.maxHealth);
    if (this._health <= 0 && gameState === 'playing') {
      this.alive = false;
      setGameState('gameOver');
      setWinner(this === player1 ? 'Player 2' : 'Player 1');
    }
  }

  get ki() {
    return this._ki;
  }

  set ki(value) {
    this._ki = constrain(value, 0, this.maxKi);
  }





  handleKeyDown(keyCode) {
    const currentTime = Date.now();
    
    if (!this.keyPressTimes[keyCode]) {
      this.keyPressTimes[keyCode] = [];
    }

    this.keyPressTimes[keyCode].push(currentTime);

    // Remove old key press times
    this.keyPressTimes[keyCode] = this.keyPressTimes[keyCode].filter(time => currentTime - time <= this.doubleTapThreshold);

    if (this.keyPressTimes[keyCode].length >= 2) {
      this.handleDoubleTap(keyCode);
      this.keyPressTimes[keyCode] = []; // Reset after handling double-tap
    }
  }

  handleDoubleTap(keyCode) {
    if (keyCode === this.moveKeys.up) {
      this.char.startJump();
    }

    if (keyCode === this.moveKeys.left) {
      this.char.dash("left");
    }

    if (keyCode === this.moveKeys.right) {
      this.char.dash("right");
    }
  }
  

  handleKeyUp(keyCode) {
    if (keyCode === this.moveKeys.up) {
      this.char.stopJump()
    }

    // release ki attack 
    if (keyCode === this.attackKey) {
      this.char.releaseKiAttack()
    }
  }

  handleKeyPress(keyCode) {
    if (!this.controllable) return

    const currentTime = millis();

    // Handle dash
    if (keyCode === this.moveKeys.left || keyCode === this.moveKeys.right) {
      console.log("dash")
      if (currentTime - this.lastLeftRightPressTime < 200) { // 300 ms for double press detection
        this.dash(keyCode);
      }
      this.lastLeftRightPressTime = currentTime;
    }
  }

  onCollision(other) {
    // Handle collision with other objects if necessary
  }
}

export { Player };
