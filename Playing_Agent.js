
import { player1, gameStateManager, setWinner, GameStates } from './game.js';


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
      console.log("remove", this)
      this.removeChar(this.currentChar);
      this.removedTimer = millis();
    }

    if (this.team.length <= 0) {
     
      gameStateManager.setState(this === player1 ?  gameStateManager.setState(GameStates.GAMEWON): gameStateManager.setState(GameStates.GAMELOSE))
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
      gameStateManager.setState(this === player1 ?  gameStateManager.setState(GameStates.GAMELOSE): gameStateManager.setState(GameStates.GAMEWON))
    } else {
      console.log(this.team.length);
      this.team.splice(indexToRemove, 1); // Use splice to remove the correct character
      console.log(this.team.length);
      this.nextChar();
    }
  }
}

export { Playing_Agent };
