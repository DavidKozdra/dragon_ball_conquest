import { GameObject} from './GameObject.js';
import {player1, player2 } from "./game.js"
class Projectile extends GameObject {
  constructor(x, y, size, color, dirX, dirY, speed, damage, following) {
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
    this.alive = true; // Add a flag to track if the projectile is alive
    this.following = true;
  }

  draw() {
    if (this.alive) {
      fill(this.color);
      ellipse(this.x, this.y, this.size, this.size);
    }
  }

  update() {
    if (this.alive) {
      if (this.following) {
        // Find the closest player
        let target_player = this.findClosestPlayer([player1, player2]);
        if (target_player) {
          // Update direction to follow the target player
          let dir = createVector(target_player.x - this.x, target_player.y - this.y);
          dir.normalize();
          this.speedX = dir.x * this.speed;
          this.speedY = dir.y * this.speed;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;
    }
  }

  findClosestPlayer(players) {
    let closestPlayer = null;
    let minDist =  80;
    for (let player of players) {
      let d = dist(this.x, this.y, player.x, player.y);
      if (d < minDist) {
        minDist = d;
        closestPlayer = player;
        
      }
    }


    return closestPlayer;
  }

  onCollision(other) {
    if (other.type === 'player') {
      other.health -= this.damage;
      this.alive = false; // Remove projectile after hitting player

      // Apply knockback
      let dx = this.dirX;
      let dy = this.dirY;
      other.applyKnockback(dx, dy, this.damage);

      // destroy projectile
    }

    if (other.type === 'projectile') {
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
  }
}

export { Projectile };
