import { GameObject } from './GameObject.js';

class Projectile extends GameObject {
  constructor(x, y, size, color, speedX, speedY, damage) {
    super('projectile', x, y);
    this.size = size;
    this.radius = size / 2;
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
    this.damage = damage;
    this.alive = true; // Add a flag to track if the projectile is alive
  }

  draw() {
    if (this.alive) {
      fill(this.color);
      ellipse(this.x, this.y, this.size, this.size);
    }
  }

  update() {
    if (this.alive) {
      this.x += this.speedX;
      this.y += this.speedY;
    }
  }

  onCollision(other) {
    if (other.type === 'player') {
      other.health -= this.damage;
      this.alive = false; // Remove projectile after hitting player
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
