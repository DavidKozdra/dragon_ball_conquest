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

    this.width = 5;
    this.height = 5;
  }

  update() {
    if (this.alive) {
      let targetPlayer = this.player === player1 ? player2 : player1;
      
      // Calculate direction vector towards the opposing player
      let dx = targetPlayer.x - this.player.x;
      let dy = targetPlayer.y - this.player.y;
      let magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;

      // Update fist position to follow the opposing player with oscillation
      this.x = this.player.x + this.offsetX + (this.direction * random(1, this.oscillateDistance)) + dx;
      this.y = this.player.y + this.offsetY + dy;
      this.direction = -this.direction; // Toggle direction to oscillate
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
      other.health -= 10; // Damage to the other player
      this.alive = false; // Deactivate fist after hitting

      // Apply force knockback
      let dx = other.x - this.player.x; // Knockback direction from the fist to the other player
      let dy = other.y - this.player.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      dx /= distance;
      dy /= distance;
      other.applyKnockback(dx, dy, 10); // Apply knockback force
    }
  }
}

export { Fist };
