import { GameObject } from './GameObject.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';

class Playing_Agent {
  constructor(charictarController, team, gameContext = null) {
    console.log(team, "team");
    this.team = team || [charictarController];
    this.char = charictarController || team[0];
    this.currentChar = 0;
    this.removedTimer = 0;
    this.gameContext = gameContext; // Reference to the game/fight context
    this.opponent = null; // Will be set by the game/fight system
    this.isDefeated = false;
  }

  // Set the opponent for this playing agent
  setOpponent(opponent) {
    this.opponent = opponent;
  }

  // Set game context (for multi-fight or single game)
  setGameContext(context) {
    this.gameContext = context;
  }

  update() {
    // Check if current character is dead and needs to be removed
    if (this.team[this.currentChar] && !this.team[this.currentChar].alive && millis() - this.removedTimer > 100) {
      console.log("remove", this);
      this.removeChar(this.currentChar);
      this.removedTimer = millis();
    }

    // Check if this player is completely defeated
    if (this.team.length <= 0 || this.team.every(char => !char.alive)) {
      this.isDefeated = true;
      this.onDefeat();
    }
  }

  // Called when this player is defeated
  onDefeat() {
    if (this.gameContext && this.gameContext.onPlayerDefeat) {
      // For fight system
      this.gameContext.onPlayerDefeat(this);
    } else if (this.gameContext && this.gameContext.gameStateManager) {
      // For main game system
      const isPlayer1 = this.gameContext.isPlayer1(this);
      this.gameContext.gameStateManager.setState(
        isPlayer1 ? this.gameContext.GameStates.GAMELOSE : this.gameContext.GameStates.GAMEWON
      );
      if (this.gameContext.setWinner) {
        this.gameContext.setWinner(isPlayer1 ? 'Player 2' : 'Player 1');
      }
    }
  }

  nextChar() {
    // Find next alive character
    let attempts = 0;
    do {
      this.currentChar = (this.currentChar + 1) % this.team.length;
      attempts++;
      // Prevent infinite loop if no characters are alive
      if (attempts >= this.team.length) {
        console.log("No alive characters found");
        return;
      }
    } while (this.team[this.currentChar] && !this.team[this.currentChar].alive);
    
    this.char = this.team[this.currentChar];
    console.log("new char ", this.team[this.currentChar]);
    console.log('current char', this.currentChar);
  }

  removeChar(indexToRemove) {
    console.log("remove");
    
    if (this.team.length === 1) {
      // Last character - player is defeated
      this.isDefeated = true;
      this.onDefeat();
    } else {
      console.log("Team size before removal:", this.team.length);
      this.team.splice(indexToRemove, 1);
      console.log("Team size after removal:", this.team.length);
      
      // Adjust current character index if needed
      if (this.currentChar >= this.team.length) {
        this.currentChar = 0;
      }
      
      // Find next alive character
      this.nextChar();
    }
  }

  // Get total team health
  getTotalHealth() {
    return this.team.reduce((total, char) => {
      return total + (char.alive ? char.health : 0);
    }, 0);
  }

  // Get total max health
  getTotalMaxHealth() {
    return this.team.reduce((total, char) => {
      return total + char.maxHealth;
    }, 0);
  }

  // Check if any characters are alive
  hasAliveCharacters() {
    return this.team.some(char => char.alive && char.health > 0);
  }

  // Get alive character count
  getAliveCount() {
    return this.team.filter(char => char.alive && char.health > 0).length;
  }
}

export { Playing_Agent };