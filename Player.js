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
    // make direction and map movement to our char 

    // charictar 
    if (keyCode === this.moveKeys.up) {
      this.char.startJump()
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
    console.log(this.char.isControllable)
    if (!this.char.isControllable) return
    const currentTime = millis();
    console.log(keyCode, this.moveKeys.left , this.moveKeys.right)
    if (keyCode === this.moveKeys.left || keyCode === this.moveKeys.right) {
      if (currentTime - this.lastLeftRightPressTime < 200) { // 300 ms for double press detection

        console.log("dash")
        let dir = keyCode === this.moveKeys.left ? "left" : "right";
        this.char.dash(dir);
      }
      this.lastLeftRightPressTime = currentTime;
    }
  }

  onCollision(other) {
    // Handle collision with other objects if necessary
  }
}

export { Player };
