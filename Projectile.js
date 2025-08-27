import { GameObject} from './GameObject.js';

class Projectile extends GameObject {
  constructor(x, y, size, color, dirX, dirY, speed, damage, following, owner = null) {
    super('projectile', x, y);
    this.size = size;
    this.radius = size / 2;
    this.color = color;
    this.dirX = dirX;
    this.dirY = dirY;
    this.speed = speed;
    this.speedX = dirX * speed;
    this.speedY = dirY * speed;
    this.damage = damage;
    this.alive = true;
    this.following = following;
    this.owner = owner; // Reference to the character/player that created this projectile
    this.targetPlayers = []; // Will be set by the fight or game system
  }

  // Method to set target players for this projectile
  setTargets(players) {
    this.targetPlayers = players.filter(player => player !== this.owner);
  }

  draw() {
    if (this.alive) {
      fill(this.color);
      ellipse(this.x, this.y, this.size, this.size);
    }
  }

  update() {
    if (this.alive) {
      if (this.following && this.targetPlayers.length > 0) {
        // Find the closest target player
        let target_player = this.findClosestPlayer(this.targetPlayers);
        if (target_player) {
          // Update direction to follow the target player
          let dir = createVector(target_player.char ? target_player.char.x - this.x : target_player.x - this.x, 
                                target_player.char ? target_player.char.y - this.y : target_player.y - this.y);
          dir.normalize();
          this.speedX = dir.x * this.speed;
          this.speedY = dir.y * this.speed;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;

      // Remove projectile if it goes too far off screen or lives too long
      if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
        this.alive = false;
      }
    }
  }

  findClosestPlayer(players) {
    let closestPlayer = null;
    let minDist = 80;
    
    for (let player of players) {
      if (!player) continue;
      
      // Handle both direct player objects and player wrapper objects
      let playerX = player.char ? player.char.x : player.x;
      let playerY = player.char ? player.char.y : player.y;
      
      if (playerX === undefined || playerY === undefined) continue;
      
      let d = dist(this.x, this.y, playerX, playerY);
      if (d < minDist) {
        minDist = d;
        closestPlayer = player;
      }
    }

    return closestPlayer;
  }

  onCollision(other) {
    if (other.type === 'player' || other.type === 'character') {
      // Don't hit the owner
      if (other === this.owner) return;
      
      other.health -= this.damage;
      this.alive = false;

      // Apply knockback
      let dx = this.dirX;
      let dy = this.dirY;
      if (other.applyKnockback) {
        other.applyKnockback(dx, dy, this.damage);
      }
    }

    if (other.type === 'projectile') {
      // Don't collide with projectiles from the same owner
      if (other.owner === this.owner) return;
      
      // Compare size and remove smaller one
      if (other.size > this.size) {
        other.size -= this.size;
        this.alive = false;
      } else if (other.size < this.size) {
        this.size -= other.size;
        other.alive = false;
      } else {
        this.alive = false;
        other.alive = false;
      }
    }

    // Collision with boundaries or other objects
    if (other.type === 'boundary' || other.type === 'wall') {
      this.alive = false;
    }
  }

  // Static method to create a projectile with proper targeting
  static createTargeted(x, y, size, color, dirX, dirY, speed, damage, following, owner, targets) {
    let projectile = new Projectile(x, y, size, color, dirX, dirY, speed, damage, following, owner);
    projectile.setTargets(targets);
    return projectile;
  }
}

export { Projectile };