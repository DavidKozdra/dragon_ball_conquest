import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, player2, gameState, setGameState, setWinner, resetGame } from './game.js';
import { Playing_Agent } from './Playing_Agent.js';
import { Projectile } from './Projectile.js';

const AIState = {
  IDLE: 'idle',
  CHARGING: 'charging',
  ATTACKING: 'attacking',
  MELEE: 'melee',
  RETREATING: 'retreating',
  FLYING: 'flying',
  AVOIDING: 'avoiding',
  DASHING: 'dashing',
};

class AI extends Playing_Agent {
  constructor(characterController, team) {
    super(characterController, team);
    this.char = characterController;
    this.state = AIState.IDLE;
    this.dashTimer = 0;
    this.attackPower = 0;
    this.inactivityThreshold = 2000; // 2 seconds
    this.lastPlayerPosition = { x: player1.char.x, y: player1.char.y };
    this.lastMoveTime = Date.now();
    this.lastAttackTime = 0; // Initialize lastAttackTime
  }

  update() {
    super.update();
    this.updatePlayerPosition();
    const distanceToPlayer1 = this.dist(this.char.x, this.char.y, player1.char.x, player1.char.y);
    const nearestProjectile = this.findNearestProjectile();
    const distanceToProjectile = nearestProjectile ? this.dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) : Infinity;
    const currentTime = Date.now();

    this.updateDashTimer();

    if (currentTime - this.lastMoveTime > this.inactivityThreshold) {
      this.state = AIState.CHARGING; // Switch to charging if player is inactive
    }

    switch (this.state) {
      case AIState.IDLE:
        this.handleIdleState(distanceToPlayer1, distanceToProjectile);
        break;
      case AIState.CHARGING:
        this.handleChargingState();
        break;
      case AIState.ATTACKING:
        this.handleAttackingState(distanceToPlayer1);
        break;
      case AIState.MELEE:
        this.handleMeleeState(distanceToPlayer1);
        break;
      case AIState.FLYING:
        this.handleFlyingState();
        break;
      case AIState.AVOIDING:
        this.handleAvoidingState(nearestProjectile);
        break;
      case AIState.DASHING:
        this.handleDashingState();
        break;
      default:
        this.state = AIState.IDLE;
        break;
    }
  }

  updatePlayerPosition() {
    const currentTime = Date.now();
    if (player1.char.x !== this.lastPlayerPosition.x || player1.char.y !== this.lastPlayerPosition.y) {
      this.lastPlayerPosition = { x: player1.char.x, y: player1.char.y };
      this.lastMoveTime = currentTime;
    }
  }

  handleIdleState(distanceToPlayer1, distanceToProjectile) {
    if (distanceToProjectile < 50) {
      this.state = AIState.AVOIDING;
    } else if (distanceToPlayer1 < 20) {
      this.state = AIState.MELEE;
    } else if (this.char.ki < 150) {
      this.state = AIState.CHARGING;
    } else if (this.char.ki > 300 || this.attackPower > 0) {
      this.state = AIState.ATTACKING;
    } else if (this.char.health < this.char.maxHealth / 2) {
      this.state = AIState.AVOIDING;
    } else if (distanceToPlayer1 > 100 && this.dashTimer === 0) {
      this.state = AIState.DASHING;
    }
  }

  handleChargingState() {
    const currentTime = Date.now();
    const delay = Math.random() * (2000 - 500) + 500; // Generate a random delay between 500 and 2000 milliseconds
  
    if (this.char.ki >= 150 && currentTime - this.lastMoveTime <= this.inactivityThreshold) {
      this.state = AIState.IDLE;
    } else if (this.char.ki >= 100 && currentTime - this.lastAttackTime > delay) {
      this.char.applyAttacking(); // Charge the attack
      if (this.char.currentAttackPower >= 100) { // Adjust the threshold as needed
        this.releaseKiAttack();
      }
    } else {
      this.char.applyCharging();
    }
  }
  

  handleAttackingState(distanceToPlayer1) {
    if (distanceToPlayer1 < 20) {
      this.state = AIState.MELEE;
    } else if (this.char.ki <= 0 && this.attackPower > 20) {
      this.releaseKiAttack();
    } else if (this.char.ki > 0 && distanceToPlayer1 > 150) {
      this.char.applyAttacking();
      this.attackPower += 1;
    } else {
      this.state = AIState.IDLE;
    }
  }

  handleMeleeState(distanceToPlayer1) {
    if (distanceToPlayer1 >= 20) {
      this.state = AIState.IDLE;
    } else {
      this.char.applyMelee();
    }
  }

  handleRetreatingState() {
    if (this.char.health >= this.char.maxHealth / 2) {
      this.state = AIState.IDLE;
    } else {
      // Move dynamically away from the player based on player's velocity
      const dx = this.char.x - player1.char.x;
      const dy = this.char.y - player1.char.y;
      const angle = Math.atan2(dy, dx);
      const playerVelocityX = player1.char.velocityX;
      const playerVelocityY = player1.char.velocityY;
      const moveX = Math.cos(angle) + (playerVelocityX > 0 ? 1 : -1);
      const moveY = Math.sin(angle) + (playerVelocityY > 0 ? 1 : -1);
      const speed = 5;
  
      this.char.applyMovement('left', moveX * speed);
      this.char.applyMovement('up', moveY * speed);
    }
  }

  handleFlyingState() {
    if (this.char.health >= this.char.maxHealth / 2) {
      this.state = AIState.IDLE;
    } else {
      this.char.applyMovement('up');
    }
  }

  handleAvoidingState(nearestProjectile) {
    if (!nearestProjectile || this.dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) >= 100) {
      this.state = AIState.IDLE;
    } else {
      this.moveAwayFromProjectile(nearestProjectile);
    }
  }

  handleDashingState() {
    const direction = this.char.x < player1.char.x ? 'right' : 'left';
    this.char.dash(direction);
    this.dashTimer = 100; // Set a cooldown for dashing to prevent constant dashing
    this.state = AIState.IDLE;
  }

  updateDashTimer() {
    if (this.dashTimer > 0) {
      this.dashTimer--;
    }
  }

  findNearestProjectile() {
    let nearestProjectile = null;
    let minDistance = Infinity;

    for (const projectile of player1.char.projectiles) {
      const distance = this.dist(this.char.x, this.char.y, projectile.x, projectile.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestProjectile = projectile;
      }
    }

    return nearestProjectile;
  }

  moveAwayFromProjectile(projectile) {
    const dx = this.char.x - projectile.x;
    const dy = this.char.y - projectile.y;
    const angle = Math.atan2(dy, dx);
    const moveX = Math.cos(angle);
    const moveY = Math.sin(angle);

    const speed = 5;

    this.char.applyMovement('left', moveX * speed);
    this.char.applyMovement('up', moveY * speed);

    if (this.char.isOnGround) {
      this.char.startJump();
    } else {
      this.char.toggleFlying();
    }
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  releaseKiAttack() {
    const currentTime = Date.now();
    const timeHeld = currentTime - this.lastAttackTime;
    console.log("AI key blast time", timeHeld);
  
    // Adjust the size modifier to ensure projectiles are not too large
    let sizeMod = timeHeld / 200; // Divide by a larger number to reduce the effect
    sizeMod = Math.min(sizeMod, 50); // Cap the size modifier to avoid excessively large projectiles
    console.log("sizeMod", sizeMod);
  
    // Calculate direction vector
    let targetPlayer = this.char === player1.char ? player2.char : player1.char;
    let dx = targetPlayer.x - this.char.x;
    let dy = targetPlayer.y - this.char.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;
  
    // Increase offset distance to ensure the projectile does not spawn near the AI
    let offset = (this.char.width / 2) + (this.attackPower / 2) + 20; // Increase the buffer distance
    let offsetX = dx * offset;
    let offsetY = dy * offset;
  
    this.char.projectiles.push(new Projectile(
      this.char.x + offsetX,
      this.char.y + offsetY,
      this.attackPower + sizeMod, // Size of the projectile based on attack power and time held
      this.char.spirit,
      dx,
      dy,
      5, // Speed of the projectile
      this.attackPower + sizeMod // Damage of the projectile based on attack power and time held
    ));
  
    this.attackPower = 0;
    this.state = AIState.IDLE;
    this.lastAttackTime = currentTime; // Set the last attack time here
  }
  
}

export { AI };