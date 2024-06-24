class GameObject {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
    }
  
    onCollision(other) {
      // Override in subclasses
    }
  
    draw() {
      // Override in subclasses
    }
  
    update() {
      // Override in subclasses
    }

    
  }
  function collides(obj1, obj2) {
    if (obj1.type === 'projectile' && obj2.type === 'projectile') {
      return false; // Projectiles do not collide with each other
    }
    let left1 = obj1.x;
    let right1 = obj1.x + (obj1.size || 10);
    let top1 = obj1.y;
    let bottom1 = obj1.y + (obj1.size || 10);
  
    let left2 = obj2.x;
    let right2 = obj2.x + (obj2.size || 10);
    let top2 = obj2.y;
    let bottom2 = obj2.y + (obj2.size || 10);
  
    return !(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2);
  }

  export { GameObject, collides };
  