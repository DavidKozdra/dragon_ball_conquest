import { GameObject } from './GameObject.js';

class Fist extends GameObject {
  constructor(player) {
    super('fist', player.x, player.y);
    this.player = player;
    this.width = 10;
    this.height = 10;

    this.alive = false;
    this.hasHit = false;

    // Direction the punch travels (unit vector, set on activate)
    this.dx = 1;
    this.dy = 0;

    // Frame-based lifetime
    this.lifetime = 0;
    this.LIFETIME = 10; // frames the punch extends outward
    this.speed = 5;     // pixels per frame of extension

    this.damage = 15;
    this.knockbackForce = 7;
  }

  activate(dx, dy) {
    this.alive = true;
    this.hasHit = false;
    this.lifetime = this.LIFETIME;
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    if (!this.alive) return;

    this.lifetime--;
    if (this.lifetime <= 0) {
      this.alive = false;
      return;
    }

    // Extend outward from the player's center each frame
    const reach = this.speed * (this.LIFETIME - this.lifetime);
    const cx = this.player.x + this.player.width / 2;
    const cy = this.player.y + this.player.height / 2;
    this.x = cx + this.dx * reach - this.width / 2;
    this.y = cy + this.dy * reach - this.height / 2;
  }

  draw() {
    if (!this.alive) return;
    // Brighten as it extends, fade on the way back
    const t = 1 - this.lifetime / this.LIFETIME;
    const alpha = 255 * (1 - t * t); // fade out toward end of lifetime
    fill(255, 200 + 55 * (1 - t), 0, alpha);
    noStroke();
    rect(this.x, this.y, this.width, this.height, 3);
  }

  onCollision(other) {
    if (!this.alive || this.hasHit) return;
    if (other.type !== 'player' || other === this.player) return;

    other.health -= this.damage;
    this.hasHit = true;
    this.alive = false;

    other.applyKnockback(this.dx, this.dy, this.knockbackForce);
  }
}

export { Fist };
