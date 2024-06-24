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
  function squareCollidesSquare(obj1, obj2) {
    let left1 = obj1.x;
    let right1 = obj1.x + obj1.width;
    let top1 = obj1.y;
    let bottom1 = obj1.y + obj1.height;
  
    let left2 = obj2.x;
    let right2 = obj2.x + obj2.width;
    let top2 = obj2.y;
    let bottom2 = obj2.y + obj2.height;
  
    return !(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2);
  }
  
  function circleCollidesCircle(obj1, obj2) {
    let dx = obj1.x - obj2.x;
    let dy = obj1.y - obj2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
  
    return distance < (obj1.radius + obj2.radius);
  }
  
  function squareCollidesCircle(square, circle) {
    let circleDistanceX = Math.abs(circle.x - square.x - square.width / 2);
    let circleDistanceY = Math.abs(circle.y - square.y - square.height / 2);
  
    if (circleDistanceX > (square.width / 2 + circle.radius)) { return false; }
    if (circleDistanceY > (square.height / 2 + circle.radius)) { return false; }
  
    if (circleDistanceX <= (square.width / 2)) { return true; }
    if (circleDistanceY <= (square.height / 2)) { return true; }
  
    let cornerDistance_sq = (circleDistanceX - square.width / 2) ** 2 +
                            (circleDistanceY - square.height / 2) ** 2;
  
    return cornerDistance_sq <= (circle.radius ** 2);
  }
  
  function collides(obj1, obj2) {
  
    if (obj1.type === 'player' && obj2.type === 'projectile') {
      return squareCollidesCircle(obj1, obj2);
    }
  
    if (obj1.type === 'projectile' && obj2.type === 'player') {
      return squareCollidesCircle(obj2, obj1);
    }
  
    if (obj1.type === 'player' && obj2.type === 'player') {
      return squareCollidesSquare(obj1, obj2);
    }
  
    if (obj1.type === 'projectile' && obj2.type === 'projectile') {
      return circleCollidesCircle(obj1, obj2);
    }

    if (obj1.type === 'fist' && obj2.type === 'player') {
      return squareCollidesSquare(obj1, obj2);
    }
  
    return false;
  }
  

  export { GameObject, collides };
  