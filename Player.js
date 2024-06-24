import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight , player1, player2,gameState,setGameState,setWinner, resetGame} from './game.js';

import { Projectile } from './Projectile.js';

class Player extends GameObject {
    constructor(x, y, attackKey, chargeKey) {
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
      this.jumpForce = 10;
      this.costOfFlying = .05;
    }
  
    get health() {
      return this._health;
    }
  
    set health(value) {
      this._health = constrain(value, 0, this.maxHealth);
      if (this._health <= 0 && gameState === 'playing') {
        setGameState("gameOver")
        setWinner( this === player1 ? 'Player 2' : 'Player 1');
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
      fill(200, 20, 100);
      rect(this.x, this.y, 10, 10);
    }
  
    update() {
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
  
      // Update projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        let projectile = this.projectiles[i];
        projectile.update();
        if (projectile.x < 0 || projectile.x > canvasWidth || projectile.y < 0 || projectile.y > canvasHeight) {
          this.projectiles.splice(i, 1); // Remove off-screen projectiles
        }
      }
  
      // Constrain the player within the canvas bounds
      this.x = constrain(this.x, 0, canvasWidth - 10);
      this.y = constrain(this.y, 0, canvasHeight - 10);
    }
  
    applyGravity() {
      if (!this.isFlying) {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
      }
    }
  
    applyMovement() {
      if (keyIsDown(LEFT_ARROW)) {
        this.x -= 2;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.x += 2;
      }
      if (keyIsDown(UP_ARROW) && this.isFlying) {
        this.y -= 2; // Move up if flying
      }
      if (keyIsDown(DOWN_ARROW) && this.isFlying) {
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
  
      this.projectiles.push(new Projectile(
        (this === player1) ? (this.x + this.currentAttackPower + 20) : (this.x - this.currentAttackPower), 
        this.y, 
        this.currentAttackPower, 
        this.spirit,
        dx * 5, 
        dy * 5, 
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