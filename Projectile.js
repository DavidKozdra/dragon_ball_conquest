import { GameObject } from './GameObject.js';

class Projectile extends GameObject {
    constructor(x, y, size, color, speedX, speedY, damage) {
      super('projectile', x, y);
      this.size = size;
      this.color = color;
      this.speedX = speedX;
      this.speedY = speedY;
      this.damage = damage;
    }
  
    draw() {
      fill(this.color);
      ellipse(this.x, this.y, this.size, this.size);
    }
  
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
    }
  
    onCollision(other) {
      if (other.type === 'player') {
        other.health -= this.damage;
      }


     if (other.type === "projectile"){
        // compare size remove smaller one 
        if (other.size > this.size){

          other.size -= this.size
          this.size = 0
          this.damage = 0

        }
        else if (other.size < this.size){
            this.size -= other.size
          other.size = 0
          other.damage = 0
        }
        else{
          this.size = 0
          this.damage = 0
          other.size = 0
          other.damage = 0
        }
     }
    }
  }
  
export { Projectile };