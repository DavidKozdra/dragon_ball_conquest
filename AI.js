import { GameObject } from './GameObject.js';
import { canvasWidth, canvasHeight, player1, gameState, setGameState, setWinner, resetGame } from './game.js';

// Define the states for the AI
const AIState = {
  IDLE: 'idle',
  CHARGING: 'charging',
  ATTACKING: 'attacking',
  MELEE: 'melee',
  RETREATING: 'retreating',
  FLYING: 'flying',
  AVOIDING: 'avoiding',
};

class AI {
  constructor(characterController) {
    this.char = characterController;
    this.state = AIState.IDLE; // Initial state
  }

  update() {
    const distanceToPlayer1 = dist(this.char.x, this.char.y, player1.char.x, player1.char.y);
    const nearestProjectile = this.findNearestProjectile();
    const distanceToProjectile = nearestProjectile ? dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) : Infinity;

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
      case AIState.RETREATING:
        this.handleRetreatingState();
        break;
      case AIState.FLYING:
        this.handleFlyingState();
        break;
      case AIState.AVOIDING:
        this.handleAvoidingState(nearestProjectile);
        break;
      default:
        this.state = AIState.IDLE;
        break;
    }
  }

  handleIdleState(distanceToPlayer1, distanceToProjectile) {
    if (distanceToProjectile < 50) {
      this.state = AIState.AVOIDING;
    } else if (distanceToPlayer1 < 20) {
      this.state = AIState.MELEE;
    } else if (this.char.ki < 150) {
      this.state = AIState.CHARGING;
    } else if (this.char.ki > 300) {
      this.state = AIState.ATTACKING;
    } else if (this.char.health < this.char.maxHealth / 2) {
      this.state = AIState.RETREATING;
    }
  }

  handleChargingState() {
    if (this.char.ki >= 150) {
      this.state = AIState.IDLE;
    } else {
      this.char.applyCharging();
    }
  }

  handleAttackingState(distanceToPlayer1) {
    if (distanceToPlayer1 < 20) {
      this.state = AIState.MELEE;
    } else if (this.char.ki <= 0) {
      this.state = AIState.IDLE;
    } else {
      this.char.applyAttacking();
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
      this.char.toggleFlying();
      this.char.applyMovement('up');
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
    if (!nearestProjectile || dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) >= 50) {
      this.state = AIState.IDLE;
    } else {
      this.moveAwayFromProjectile(nearestProjectile);
    }
  }

  findNearestProjectile() {
    let nearestProjectile = null;
    let minDistance = Infinity;

    for (const projectile of player1.char.projectiles) {
      const distance = dist(this.char.x, this.char.y, projectile.x, projectile.y);
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

    this.char.applyMovement('x', moveX);
    this.char.applyMovement('y', moveY);
  }
}

export { AI };
