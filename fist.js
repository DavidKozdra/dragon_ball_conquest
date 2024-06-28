import { GameObject } from './GameObject.js';
import { player1, player2 } from './game.js';

class Fist extends GameObject {
  constructor(player, offsetX, offsetY) {
    super('fist', player.x + offsetX, player.y + offsetY);
    this.player = player;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.size = 5; // Size of the fist
    this.alive = false; // Initially inactive
    this.direction = 1;
    this.oscillateDistance = 5; // Distance to oscillate left and right

    this.width = 8;
    this.height = 8;
  }

  update() {
    if (this.alive) {

      this.x += 1 + (this.direction * random(1, this.oscillateDistance));
      this.y += 1;
      this.direction = -this.direction; // Toggle direction to oscillate

      
      // Ensure the fist stays within the player's bounds
      this.x = Math.max(this.player.x + 5, Math.min(this.x, this.player.x + this.player.width - this.width));
      this.y = Math.max(this.player.y, Math.min(this.y, this.player.y + this.player.height - this.height));
    }
  }

  draw() {
    if (this.alive) {
      fill(255, 0, 0); // Color of the fist
      rect(this.x, this.y, this.size, this.size);
    }
  }

  onCollision(other) {
    if (this.alive && other.type === 'player' && other !== this.player) {
      other.health -= 1; // Damage to the other player
      this.alive = false; // Deactivate fist after hitting

      // Apply force knockback
      let dx = other.x - this.x; // Knockback direction from the fist to the other player
      let dy = other.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        dx /= distance;
        dy /= distance;
      }

      // Apply knockback force
      other.applyKnockback(dx, dy, random(1,10));
    }
  }
}

// Example random function if not already defined
function random(min, max) {
  return Math.random() * (max - min) + min;
}

export { Fist };
