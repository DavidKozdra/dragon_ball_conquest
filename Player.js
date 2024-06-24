import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';

class Player extends GameObject {
  constructor(x, y, attackKey, chargeKey, moveKeys, meleeKey) {
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
    this.velocityX = 0;
    this.velocityY = 1;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.projectiles = [];
    this.fists = [new Fist(this, 5, 5)]; // Create fists once and reuse them
    this.currentAttackPower = 0;
    this.spirit = [0, 0, 200];
    this.attackKey = attackKey;
    this.chargeKey = chargeKey;
    this.meleeKey = meleeKey;
    this.moveKeys = moveKeys; // Object containing move keys
    this.jumpForce = 20;
    this.shortHopForce = 100; // Adjusted for a reasonable short hop
    this.costOfFlying = 0.05;
    this.width = 10; // Player width
    this.height = 10; // Player height
    this.size = 10; // Size of the player
    this.alive = true;
    this.friction = 0.9; // Friction to slow down movement
    this.maxSpeed = 5; // Maximum speed
    this.maxJumpDuration = 300; // Adjusted for a reasonable max jump duration
    this.jumpKeyPressTime = 0;
    this.isJumping = false;
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

  draw() {
    if (this.alive) {
      fill(this == player1 ? 200 : 0, 20, 100);
    } else {
      fill(100, 100, 100); // Gray color if dead
    }
    rect(this.x, this.y, this.width, this.height);

    // Draw fists
    for (let fist of this.fists) {
      fist.draw();
    }
  }

  update() {
    if (!this.alive) return; // Skip updates if player is dead
    if (gameState === 'paused') return; // Skip updates if game is paused
    this.applyGravity();
    this.applyCharging();
    this.applyMovement();
    this.checkGrounded();
    this.applyAttacking();
    this.applyMelee();

    if (this.flyToggleCooldown > 0) {
      this.flyToggleCooldown--;
    }
    if (this.isFlying && this.ki > 0 && !this.grounded) {
      this.ki -= this.costOfFlying;
    } else if (this.isFlying && this.ki <= 0) {
      this.isFlying = false; // Stop flying if ki is depleted
    }

    // Apply friction
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Update projectiles and remove dead ones
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let projectile = this.projectiles[i];
      projectile.update();
      if (!projectile.alive || projectile.x < 0 || projectile.x > canvasWidth || projectile.y < 0 || projectile.y > canvasHeight) {
        this.projectiles.splice(i, 1); // Remove dead or off-screen projectiles
      }
    }

    // Update fists
    for (let fist of this.fists) {
      fist.update();
    }

    // Constrain the player within the canvas bounds
    this.x = constrain(this.x, 0, canvasWidth - this.width);
    this.y = constrain(this.y, 0, canvasHeight - this.height);

    if (this.isJumping) {
      this.jump();
    }
  }

  applyGravity() {
    if (!this.isFlying) {
      this.velocityY += this.gravity;
    }
  }

  applyMovement() {
    if (keyIsDown(this.moveKeys.left)) {
      this.accelerationX = -0.5;
    } else if (keyIsDown(this.moveKeys.right)) {
      this.accelerationX = 0.5;
    } else {
      this.accelerationX = 0;
    }

    if (this.isFlying) {
      if (keyIsDown(this.moveKeys.up)) {
        this.accelerationY = -0.5; // Move up if flying (negative direction in p5.js)
      } else if (keyIsDown(this.moveKeys.down)) {
        this.accelerationY = 0.5; // Move down if flying
      } else {
        this.accelerationY = 0;
      }
    } else {
      this.accelerationY = 0;
    }

    this.velocityX += this.accelerationX;
    this.velocityY += this.accelerationY;

    // Limit the speed
    this.velocityX = constrain(this.velocityX, -this.maxSpeed, this.maxSpeed);
    this.velocityY = constrain(this.velocityY, -this.maxSpeed, this.maxSpeed);
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

  applyMelee() {
    for (let fist of this.fists) {
      fist.alive = keyIsDown(this.meleeKey); // Toggle fist activity based on melee key
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
    if (this.y >= 335) {
      this.y = 335;
      this.accelerationY = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
  }

  startJump() {
    if (this.grounded) {
      this.jumpKeyPressTime = millis();
      this.isJumping = true;
    } else {
      this.toggleFlying();
    }
  }

  jump() {
    let currentTime = millis();
    let jumpDuration = currentTime - this.jumpKeyPressTime;
    let jumpForce = this.shortHopForce;

    if (jumpDuration < this.maxJumpDuration) {
      jumpForce += (this.jumpForce - this.shortHopForce) * (jumpDuration / this.maxJumpDuration);
      this.velocityY = -jumpForce;
    } else {
      this.isJumping = false;
    }
  }

  applyKnockback(dx, dy, force) {
    this.velocityX += dx * force;
    this.velocityY += dy * force;
  }

  dash(direction) {
    if (this.ki < this.costOfFlying * 50) {
      return; // Not enough ki for dashing
    }
    console.log("dash")

    const dashSpeed = 200; // Adjust dash speed as needed
    if (direction === this.moveKeys.left) {
      this.x -= dashSpeed;
      this.accelerationX = 0;
    } else if (direction === this.moveKeys.right) {
      this.x += dashSpeed;
      this.accelerationX = 0;
    } else if (direction === this.moveKeys.up) {
      this.y -= dashSpeed;
      this.accelerationY = 0;
    } else if (direction === this.moveKeys.down) {
      this.y += dashSpeed;
      this.accelerationY = 0;
    }

    this.ki -= this.costOfFlying * 50;
  }

  handleKeyDown(keyCode) {
    if (keyCode === this.moveKeys.up) {
      this.startJump();
    }
  }

  handleKeyUp(keyCode) {
    if (keyCode === this.moveKeys.up) {
      this.isJumping = false;
    }
  }

  handleKeyPress(keyCode) {
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
