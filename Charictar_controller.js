import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Projectile } from './Projectile.js';
import { Fist } from './fist.js';

class charController extends GameObject {
  constructor(x, y, controllable=true, spirit=[0, 0, 200], name) {
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
    this.spirit =spirit;
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
    this.isControllable = controllable;
    this.dashSpeed = 200;

    this.name = name;
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = constrain(value, 0, this.maxHealth);
    if (this._health <= 0 && gameState === 'playing') {
      this.alive = false;
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
      fill(this.spirit[0], this.spirit[1], this.spirit[2]); 
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
    this.applyMovement();
    this.checkGrounded();

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

  applyMovement(direction) {
    // Reset acceleration
    this.accelerationX = 0;
    this.accelerationY = 0;
  
    // Apply acceleration based on direction
    switch (direction) {
      case 'left':
        this.accelerationX = -0.5;
        break;
      case 'right':
        this.accelerationX = 0.5;
        break;
      case 'up':
        if (this.isFlying) {
          this.accelerationY = -0.5; // Move up if flying (negative direction in p5.js)
        }
        break;
      case 'down':
        if (this.isFlying) {
          this.accelerationY = 0.5; // Move down if flying
        }
        break;
      default:
        // No movement if no valid direction is provided
        break;
    }
  
    // Update velocity based on acceleration
    this.velocityX += this.accelerationX;
    this.velocityY += this.accelerationY;
  
    // Limit the speed
    this.velocityX = constrain(this.velocityX, -this.maxSpeed, this.maxSpeed);
    this.velocityY = constrain(this.velocityY, -this.maxSpeed, this.maxSpeed);
  }
  

  applyCharging() {
    if (this.currentAttackPower > 0 && this.isControllable) {
      return
    }

      if (this.ki < this.maxKi) {
        this.ki += this.kiRate;
    }
  }

  applyAttacking() {
    if (this.ki <= 0) {
      if (this.currentAttackPower > 0) {
        this.releaseKiAttack();
      }
      return;
    }
    this.ki -= 1; // Drain ki while charging
    this.currentAttackPower += 1;
  }
  

  applyMelee() {
    for (let fist of this.fists) {
      // Set the fist to be alive
      fist.alive = true;
  
      // Clear any existing timeout to avoid conflicts
      if (fist.timeout) {
        clearTimeout(fist.timeout);
      }
  
      // Set the fist to be not alive after the specified duration
      fist.timeout = setTimeout(() => {
        fist.alive = false;
        fist.timeout = null; // Clear the reference to the timeout
      }, 100); // 3.5 minutes
    }
  }

  releaseKiAttack() {
    // Calculate direction vector
    let targetPlayer = (this === player1.char) ? player2.char : player1.char;
    //console.log(targetPlayer);
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
      this.currentAttackPower, // Size of the projectile based on attack power
      this.spirit,
      dx,
      dy,
      5, // Speed of the projectile
      this.currentAttackPower // Damage of the projectile based on attack power
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
  stopJump() {
    this.isJumping = false;
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
    ///console.log("dash");
    let dashSpeed = this.dashSpeed;
  
    switch (direction) {
      case 'left':
        //console.log("dash left")
        this.x -= dashSpeed;
        this.accelerationX = 0;
        break;
      case 'right':
        this.x += dashSpeed;
        this.accelerationX = 0;
        break;
      case 'up':
        this.y -= dashSpeed;
        this.accelerationY = 0;
        break;
      case 'down':
        this.y += dashSpeed;
        this.accelerationY = 0;
        break;
      default:
        // No movement if no valid direction is provided
        break;
    }
  
    this.ki -= this.costOfFlying * 50;
  }
  

  onCollision(other) {
    // Handle collision with other objects if necessary
  }
}

export { charController };
