import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';

class Playing_Agent {
  constructor(charictarController, team) {
    console.log(team, "team")
    this.team = team || [charictarController];
    this.char = charictarController || team[0];
    this.currentChar = 0;

    this.removedTimer = 0;
  }

  update() {
    if (!this.team[this.currentChar].alive && millis() - this.removedTimer > 100) {
      this.removeChar(this.currentChar);
      this.removedTimer = millis();
    }

    if (this.team.length <= 0) {
      setGameState('gameOver');
      setWinner(this === player1 ? 'Player 2' : 'Player 1');
    }
    
  }

  nextChar() {
    this.currentChar = (this.currentChar + 1) % this.team.length;
    this.char = this.team[this.currentChar];
    console.log("new char ", this.team[this.currentChar]);
    console.log('current char', this.currentChar);
  }

  removeChar(indexToRemove) {
    console.log("remove");
    if (this.team.length === 1) {
      setGameState('gameOver');
      setWinner(this === player1 ? 'Player 2' : 'Player 1');
    } else {
      console.log(this.team.length);
      this.team.splice(indexToRemove, 1); // Use splice to remove the correct character
      console.log(this.team.length);
      this.nextChar();
    }
  }
}

export { Playing_Agent };
