import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';
import { Playing_Agent } from './Playing_Agent.js';

class Player extends Playing_Agent{
  constructor(attackKey, chargeKey, moveKeys, meleeKey,charictarController, team) {
    super (charictarController, team)
    this.attackKey = attackKey;
    this.chargeKey = chargeKey;
    this.meleeKey = meleeKey;
    this.moveKeys = moveKeys; // Object containing move keys
    this.controllable = false
    this.char = charictarController || team[0];
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
    if (!this.char.isControllable) return
    const currentTime = millis();
    if (keyCode === this.moveKeys.left || keyCode === this.moveKeys.right) {
      if (currentTime - this.lastLeftRightPressTime < 200) { // 300 ms for double press detection

        console.log("dash")
        let dir = keyCode === this.moveKeys.left ? "left" : "right";
        this.char.dash(dir);
      }
      this.lastLeftRightPressTime = currentTime;
    }
  }

}

export { Player };
