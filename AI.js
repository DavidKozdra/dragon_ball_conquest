import {  player1, player2 } from './game.js';
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
  CIRCLING: 'circling',
  AGGRESSIVE: 'aggressive',
};

class AI extends Playing_Agent {
  constructor(characterController, team, currentGenome) {
    super(team[0], team);
    this.char = team[0];
    this.state = AIState.IDLE;
    this.dashTimer = 0;
    this.attackPower = 0;
    this.inactivityThreshold = 800; // Reduced from 2000 to 800ms for faster reactions
    this.enemy = (player1 == this) ? player2 : player1;
    this.lastPlayerPosition = { x: 0, y: 0 };
    this.lastMoveTime = Date.now();
    this.lastAttackTime = 0;
    this.lastStateChange = Date.now();
    this.stateChangeDelay = this.randomBetween(200, 600); // Random delay between state changes
    this.aggressiveness = Math.random(); // 0-1, affects behavior choices
    this.currentStrategy = this.pickRandomStrategy();
    this.strategyTimer = 0;
    this.circlingDirection = Math.random() > 0.5 ? 1 : -1;
    this.chargeBuildup = 0;
    this.feintChance = 0.15; // 15% chance to feint attacks
    this.aiChoices = [AIState.MELEE, AIState.CHARGING, AIState.ATTACKING, AIState.DASHING, AIState.CIRCLING, AIState.IDLE]
    const nWeightsPerState = Math.floor(currentGenome.length / this.aiChoices.length);

    this.weights = Array.from({ length: this.aiChoices.length }, (_, i) =>
      currentGenome.slice(i * nWeightsPerState, (i + 1) * nWeightsPerState)
    );
  }

  update() {
    super.update();
    if(this.enemy == null){
      if(player1 == this && player2 != null){
        this.enemy = player2;
      }
      return;
    }

    this.updatePlayerPosition();
    this.updateTimers();
    
    const distanceToPlayer = this.dist(this.char.x, this.char.y, this.enemy.char.x, this.enemy.char.y);
    const nearestProjectile = this.findNearestProjectile();
    const distanceToProjectile = nearestProjectile ? this.dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) : Infinity;
    const currentTime = Date.now();

    // Add some randomization to decision making
    const shouldMakeDecision = currentTime - this.lastStateChange > this.stateChangeDelay || 
                               this.isInDanger(distanceToProjectile, distanceToPlayer);

    if (!shouldMakeDecision && this.state !== AIState.AVOIDING) {
      this.executeCurrentState(distanceToPlayer, distanceToProjectile, nearestProjectile);
      return;
    }

    // Make decisions faster with more randomization
    this.makeStrategicDecision(distanceToPlayer, distanceToProjectile, nearestProjectile);
    this.executeCurrentState(distanceToPlayer, distanceToProjectile, nearestProjectile);
  }

  updateTimers() {
    this.updateDashTimer();
    this.strategyTimer--;
    
    // Change strategy periodically for unpredictability
    if (this.strategyTimer <= 0) {
      this.currentStrategy = this.pickRandomStrategy();
      this.strategyTimer = this.randomBetween(300, 800);
    }
  }

  isInDanger(distanceToProjectile, distanceToPlayer) {
    return distanceToProjectile < 60 || 
           (distanceToPlayer < 15 && this.enemy.char.isAttacking) ||
           this.char.health < this.char.maxHealth * 0.2;
  }

  makeStrategicDecision(distanceToPlayer, distanceToProjectile, nearestProjectile) {
    const currentTime = Date.now();
    const healthRatio = this.char.health / this.char.maxHealth;
    const kiRatio = this.char.ki / this.char.maxKi;
    
    // Emergency responses (highest priority)
    if (distanceToProjectile < 50) {
      this.changeState(AIState.AVOIDING);
      return;
    }
    
    if (healthRatio < 0.25 && Math.random() > 0.3) {
      this.changeState(AIState.RETREATING);
      return;
    }
    this.decideState(distanceToPlayer, healthRatio, kiRatio, distanceToProjectile);

  }

  handleAggressiveStrategy(distanceToPlayer, kiRatio) {
    const rand = Math.random();
    
    if (distanceToPlayer < 25) {
      if (rand < 0.7) {
        this.changeState(AIState.MELEE);
      } else {
        this.changeState(AIState.DASHING);
      }
    } else if (kiRatio > 0.4 && rand < 0.6) {
      this.changeState(AIState.ATTACKING);
    } else if (distanceToPlayer > 80 && this.dashTimer === 0 && rand < 0.5) {
      this.changeState(AIState.DASHING);
    } else if (rand < 0.3) {
      this.changeState(AIState.CIRCLING);
    } else {
      this.changeState(AIState.CHARGING);
    }
  }

  handleDefensiveStrategy(distanceToPlayer, healthRatio, kiRatio) {
    const rand = Math.random();
    
    if (healthRatio < 0.5 && rand < 0.4) {
      this.changeState(AIState.RETREATING);
    } else if (kiRatio < 0.3) {
      this.changeState(AIState.CHARGING);
    } else if (distanceToPlayer > 60 && kiRatio > 0.5 && rand < 0.6) {
      this.changeState(AIState.ATTACKING);
    } else if (distanceToPlayer < 30 && rand < 0.3) {
      this.changeState(AIState.MELEE);
    } else {
      this.changeState(AIState.CIRCLING);
    }
  }


  // !!
  decideState(distanceToPlayer, healthRatio, kiRatio, distanceToProjectile) { 

    let states = this.aiChoices; //[AIState.MELEE, AIState.CHARGING, AIState.ATTACKING, AIState.DASHING, AIState.CIRCLING, AIState.IDLE]
    function f(distanceToPlayer, healthRatio, kiRatio, distanceToProjectile, dashTimer, weights) {
      let x = [distanceToPlayer, healthRatio, kiRatio, distanceToProjectile, dashTimer]
      let sum = [];
      for (let i=0; i < x.length; i++){
        sum.push(weights[i][0]); // Bias added
        for (let j=1; j < x[i].length; j++){
          // console.log(weights[i][j], "I J !")
          sum[i] += weights[i][j] * x[i][j];
        }
      }

      // console.log("sum: ", sum, "weights: ", weights)

      return sum;
    }
    let arr = f(distanceToPlayer, healthRatio, kiRatio, distanceToProjectile, this.dashTimer, this.weights);
    this.changeState(states[arr.indexOf(Math.max(...arr))]);
  }

  handleUnpredictableStrategy(distanceToPlayer) {
    const rand = Math.random();
    const states = [AIState.ATTACKING, AIState.MELEE, AIState.CIRCLING, AIState.DASHING, AIState.CHARGING];
    
    if (rand < 0.8) {
      const randomState = states[Math.floor(Math.random() * states.length)];
      this.changeState(randomState);
    } else {
      // Feint - start charging then immediately switch
      if (this.state === AIState.CHARGING && rand < this.feintChance) {
        this.changeState(distanceToPlayer < 30 ? AIState.MELEE : AIState.DASHING);
      }
    }
  }

  executeCurrentState(distanceToPlayer, distanceToProjectile, nearestProjectile) {
    switch (this.state) {
      case AIState.IDLE:
        this.handleIdleState();
        break;
      case AIState.CHARGING:
        this.handleChargingState();
        break;
      case AIState.ATTACKING:
        this.handleAttackingState(distanceToPlayer);
        break;
      case AIState.MELEE:
        this.handleMeleeState(distanceToPlayer);
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
      case AIState.DASHING:
        this.handleDashingState();
        break;
      case AIState.CIRCLING:
        this.handleCirclingState(distanceToPlayer);
        break;
      default:
        this.changeState(AIState.IDLE);
        break;
    }
  }

  changeState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.lastStateChange = Date.now();
      this.stateChangeDelay = this.randomBetween(150, 500); // Faster state changes
    }
  }

  handleIdleState() {
    // Add small random movements to look more natural
    if (Math.random() < 0.1) {
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      this.char.applyMovement(direction, 1);
    }
  }

  handleChargingState() {
    const currentTime = Date.now();
    const chargeTime = this.randomBetween(300, 1200); // Variable charge time
    
    this.chargeBuildup++;
    
    if (this.char.ki >= 150 || this.chargeBuildup > chargeTime / 10) {
      // Randomly decide to attack or keep charging
      if (Math.random() < 0.7) {
        this.changeState(AIState.ATTACKING);
      }
    } else {
      this.char.ki += this.randomBetween(1, 3); // Variable ki gain
    }
  }

  handleAttackingState(distanceToPlayer) {
    const rand = Math.random();
    
    // Add movement while attacking for dynamic combat
    if (rand < 0.3) {
      const direction = this.char.x < this.enemy.char.x ? 'right' : 'left';
      this.char.applyMovement(direction, 2);
    }
    
    if (distanceToPlayer < 25 && rand < 0.4) {
      this.changeState(AIState.MELEE);
    } else if (this.char.ki > 50 && rand < 0.6) {
      this.char.applyAttacking();
      this.attackPower += this.randomBetween(1, 3);
      
      // Randomly release attack early or late
      if (this.attackPower > this.randomBetween(20, 80)) {
        this.releaseKiAttack();
      }
    } else {
      this.changeState(AIState.IDLE);
    }
  }

  handleMeleeState(distanceToPlayer) {
    if (distanceToPlayer >= 30) {
      this.changeState(AIState.DASHING);
    } else {
      this.char.applyMelee();
      
      // Add random dodging during melee
      if (Math.random() < 0.2) {
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        this.char.applyMovement(direction, 3);
      }
    }
  }

  handleCirclingState(distanceToPlayer) {
    const optimalDistance = this.randomBetween(40, 70);
    
    // Circle around the enemy
    const angle = Math.atan2(this.enemy.char.y - this.char.y, this.enemy.char.x - this.char.x);
    const circleAngle = angle + (this.circlingDirection * 0.5);
    
    const moveX = Math.cos(circleAngle) * 3;
    const moveY = Math.sin(circleAngle) * 3;
    
    this.char.applyMovement('left', moveX);
    this.char.applyMovement('up', moveY);
    
    // Randomly change circling direction
    if (Math.random() < 0.05) {
      this.circlingDirection *= -1;
    }
    
    // Attack while circling sometimes
    if (Math.random() < 0.1 && this.char.ki > 100) {
      this.changeState(AIState.ATTACKING);
    }
  }

  handleRetreatingState() {
    if (this.char.health >= this.char.maxHealth * 0.4) {
      this.changeState(AIState.CIRCLING);
    } else {
      // Enhanced retreat logic with prediction
      const dx = this.char.x - this.enemy.char.x;
      const dy = this.char.y - this.enemy.char.y;
      const angle = Math.atan2(dy, dx);
      
      // Predict enemy movement
      const playerVelocityX = this.enemy.char.velocityX || 0;
      const playerVelocityY = this.enemy.char.velocityY || 0;
      
      const moveX = Math.cos(angle) + (playerVelocityX > 0 ? 1 : -1) * 0.5;
      const moveY = Math.sin(angle) + (playerVelocityY > 0 ? 1 : -1) * 0.5;
      const speed = this.randomBetween(4, 7);

      this.char.applyMovement('left', moveX * speed);
      this.char.applyMovement('up', moveY * speed);
      
      // Jump or fly randomly while retreating
      if (Math.random() < 0.3) {
        if (this.char.isOnGround) {
          this.char.startJump();
        } else if (Math.random() < 0.5) {
          this.char.toggleFlying();
        }
      }
    }
  }

  handleFlyingState() {
    if (this.char.health >= this.char.maxHealth * 0.4) {
      this.changeState(AIState.CIRCLING);
    } else {
      this.char.applyMovement('up', this.randomBetween(3, 6));
    }
  }

  handleAvoidingState(nearestProjectile) {
    if (!nearestProjectile || this.dist(this.char.x, this.char.y, nearestProjectile.x, nearestProjectile.y) >= 80) {
      this.changeState(AIState.CIRCLING);
    } else {
      this.moveAwayFromProjectile(nearestProjectile);
    }
  }

  handleDashingState() {
    const rand = Math.random();
    let direction;
    
    // More intelligent dashing
    if (rand < 0.7) {
      direction = this.char.x < this.enemy.char.x ? 'right' : 'left';
    } else {
      // Sometimes dash in unexpected direction
      direction = Math.random() > 0.5 ? 'right' : 'left';
    }
    
    this.char.dash(direction);
    this.dashTimer = this.randomBetween(60, 120);
    this.changeState(AIState.IDLE);
  }

  updatePlayerPosition() {
    const currentTime = Date.now();
    if (this.enemy.char.x !== this.lastPlayerPosition.x || this.enemy.char.y !== this.lastPlayerPosition.y) {
      this.lastPlayerPosition = { x: this.enemy.char.x, y: this.enemy.char.y };
      this.lastMoveTime = currentTime;
    }
  }

  updateDashTimer() {
    if (this.dashTimer > 0) {
      this.dashTimer--;
    }
  }

  findNearestProjectile() {
    let nearestProjectile = null;
    let minDistance = Infinity;

    for (const projectile of this.enemy.char.projectiles) {
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
    
    // Add randomness to avoidance
    const randomOffset = (Math.random() - 0.5) * 0.5;
    const moveX = Math.cos(angle + randomOffset);
    const moveY = Math.sin(angle + randomOffset);

    const speed = this.randomBetween(6, 9);

    this.char.applyMovement('left', moveX * speed);
    this.char.applyMovement('up', moveY * speed);

    // More varied evasion techniques
    if (Math.random() < 0.4) {
      if (this.char.isOnGround) {
        this.char.startJump();
      } else if (Math.random() < 0.6) {
        this.char.toggleFlying();
      }
    }
  }

  pickRandomStrategy() {
    const strategies = ['aggressive', 'defensive', 'balanced', 'unpredictable'];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  releaseKiAttack() {
    const currentTime = Date.now();
    const timeHeld = Math.max(currentTime - this.lastAttackTime, 200);
  
    let sizeMod = timeHeld / 300;
    sizeMod = Math.min(sizeMod, 40);
    
    // Add accuracy variation
    let targetPlayer = this.char === player1.char ? player2.char : player1.char;
    let dx = targetPlayer.x - this.char.x;
    let dy = targetPlayer.y - this.char.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    
    // Predict target movement for better accuracy
    const predictionFactor = 0.1;
    dx += (targetPlayer.velocityX || 0) * predictionFactor;
    dy += (targetPlayer.velocityY || 0) * predictionFactor;
    
    magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;
    
    // Add slight inaccuracy for realism
    const inaccuracy = (Math.random() - 0.5) * 0.2;
    dx += inaccuracy;
    dy += inaccuracy;
  
    let offset = (this.char.width / 2) + (this.attackPower / 2) + 25;
    let offsetX = dx * offset;
    let offsetY = dy * offset;
  
    this.char.projectiles.push(new Projectile(
      this.char.x + offsetX,
      this.char.y + offsetY,
      this.attackPower + sizeMod,
      this.char.spirit,
      dx,
      dy,
      this.randomBetween(4, 7), // Variable projectile speed
      this.attackPower + sizeMod
    ));
  
    this.attackPower = 0;
    this.chargeBuildup = 0;
    this.changeState(AIState.IDLE);
    this.lastAttackTime = currentTime;
  }
}

export { AI };