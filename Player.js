import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';

class Player extends GameObject {
  constructor(x, y, attackKey, chargeKey, moveKeys) {
    super('player');
    this.x = x;
    this.y = y;
    this._health = 200;
    this.maxHealth = 200;
    this._ki = 50;
    this.maxKi = 200;
    this.canFly = true;
    this.isFlying = false;
    this.gravity = 1;
    this.flyToggleCooldown = 0;
    this.kiRate = 1;
    this.grounded = false;
    this.velocityY = 1;
    this.projectiles = [];
    this.currentAttackPower = 0;
    this.spirit = [0, 0, 200];
    this.attackKey = attackKey;
    this.chargeKey = chargeKey;
    this.moveKeys = moveKeys; // Object containing move keys
    this.jumpForce = 10;
    this.costOfFlying = 0.05;
    this.width = 10; // Player width
    this.height = 10; // Player height
    this.alive = true;
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
      setTimeout(resetGame, 4000); // Restart the game after 4 seconds
    }
  }

  get ki() {
    return this._ki;
  }

  set ki(value) {
    this._ki = constrain(value, 0, this.maxKi);
  }

  draw() {
    if (this.alive) {
      fill(200, 20, 100);
    } else {
      fill(100, 100, 100); // Gray color if dead
    }
    rect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (!this.alive) return; // Skip updates if player is dead

    this.applyGravity();
    this.applyCharging();
    this.applyMovement();
    this.checkGrounded();
    this.applyAttacking();

    if (this.flyToggleCooldown > 0) {
      this.flyToggleCooldown--;
    }
    if (this.isFlying && this.ki > 0 && !this.grounded) {
      this.ki -= this.costOfFlying;
    } else if (this.isFlying && this.ki <= 0) {
      this.isFlying = false; // Stop flying if ki is depleted
    }

    // Update projectiles and remove dead ones
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let projectile = this.projectiles[i];
      projectile.update();
      if (!projectile.alive || projectile.x < 0 || projectile.x > canvasWidth || projectile.y < 0 || projectile.y > canvasHeight) {
        this.projectiles.splice(i, 1); // Remove dead or off-screen projectiles
      }
    }

    // Constrain the player within the canvas bounds
    this.x = constrain(this.x, 0, canvasWidth - this.width);
    this.y = constrain(this.y, 0, canvasHeight - this.height);
  }

  applyGravity() {
    if (!this.isFlying) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
    }
  }

  applyMovement() {
    if (keyIsDown(this.moveKeys.left)) {
      this.x -= 2;
    }
    if (keyIsDown(this.moveKeys.right)) {
      this.x += 2;
    }
    if (keyIsDown(this.moveKeys.up) && this.isFlying) {
      this.y -= 2; // Move up if flying
    }
    if (keyIsDown(this.moveKeys.down) && this.isFlying) {
      this.y += 2; // Move down if flying
    }
  }

  applyCharging() {
    if (keyIsDown(this.chargeKey)) { // Charging key for charging ki
      if (this.ki < this.maxKi) {
        this.ki += this.kiRate;
      }
    }
  }

  applyAttacking() {
    if (this.ki <= 0) {
      if (this.currentAttackPower > 0) {
        this.releaseKiAttack();
      }
      return;
    }

    if (keyIsDown(this.attackKey)) { // Attacking key for attacking
      this.ki -= 1;
      this.currentAttackPower += 1;
    } else if (this.currentAttackPower > 0) {
      this.releaseKiAttack();
    }
  }

  releaseKiAttack() {
    // Calculate direction vector
    let targetPlayer = this === player1 ? player2 : player1;
    let dx = targetPlayer.x - this.x;
    let dy = targetPlayer.y - this.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;
  
    // Apply diagonal offset considering projectile size and player size
    let offset = (this.width / 2) + (this.currentAttackPower / 2) + 5; // Additional 5 units for a buffer
    let offsetX = dx * offset;
    let offsetY = dy * offset;
  
    this.projectiles.push(new Projectile(
      this.x + offsetX,
      this.y + offsetY,
      this.currentAttackPower,
      this.spirit,
      dx,
      dy,
      5, // Speed of the projectile
      this.currentAttackPower
    ));
  
    this.currentAttackPower = 0;
  }
  

  toggleFlying() {
    if (this.canFly && this.flyToggleCooldown == 0) {
      this.isFlying = !this.isFlying;
      this.flyToggleCooldown = 20; // Cooldown to prevent immediate retriggering
    }
  }

  checkGrounded() {
    if (this.y >= 340) {
      this.y = 340;
      this.velocityY = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
  }

  jump() {
    if (this.grounded) {
      this.velocityY = -this.jumpForce;
      this.grounded = false;
    }
  }

  onCollision(other) {
    // Handle collision with other objects if necessary
  }
}

export { Player };
