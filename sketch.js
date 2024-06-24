let clouds = [];
let delta = 1;

const costOfFlying = 0.1;
const jumpForce = 5;
const canvasWidth = 400;
const canvasHeight = 400;
let timer = 120;

class Player {
  constructor(x, y, attackKey, chargeKey) {
    this.x = x;
    this.y = y;
    this._health = 200;
    this.maxHealth = 200;
    this._ki = 50;
    this.maxKi = 200;
    this.canFly = true;
    this.isFlying = false;
    this.gravity = 1;
    this.flyToggleCooldown = 0;
    this.kiRate = 1;
    this.grounded = false;
    this.velocityY = 1;
    this.projectiles = [];
    this.currentAttackPower = 0;
    this.spirit = [0, 0, 200];
    this.attackKey = attackKey;
    this.chargeKey = chargeKey;
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = constrain(value, 0, this.maxHealth);
  }

  get ki() {
    return this._ki;
  }

  set ki(value) {
    this._ki = constrain(value, 0, this.maxKi);
  }

  draw() {
    fill(200, 20, 100);
    rect(this.x, this.y, 10, 10);
  }

  update() {
    this.applyGravity();
    this.applyCharging();
    this.applyMovement();
    this.checkGrounded();
    this.applyAttacking();

    if (this.flyToggleCooldown > 0) {
      this.flyToggleCooldown--;
    }
    if (this.isFlying && this.ki > 0 && !this.grounded) {
      this.ki -= costOfFlying;
    } else if (this.isFlying && this.ki <= 0) {
      this.isFlying = false; // Stop flying if ki is depleted
    }

    // Constrain the player within the canvas bounds
    this.x = constrain(this.x, 0, canvasWidth - 10);
    this.y = constrain(this.y, 0, canvasHeight - 10);
  }

  applyGravity() {
    if (!this.isFlying) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
    }
  }

  applyMovement() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 2;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 2;
    }
    if (keyIsDown(UP_ARROW) && this.isFlying) {
      this.y -= 2; // Move up if flying
    }
    if (keyIsDown(DOWN_ARROW) && this.isFlying) {
      this.y += 2; // Move down if flying
    }
  }

  applyCharging() {
    if (keyIsDown(this.chargeKey)) { // Charging key for charging ki
      if (this.ki < this.maxKi) {
        this.ki += this.kiRate;
      }
    }
  }

  applyAttacking() {
    if (this.ki <= 0) {
      if (this.currentAttackPower > 0) {
        this.releaseKiAttack();
      }
      return;
    }

    if (keyIsDown(this.attackKey)) { // Attacking key for attacking
      this.ki -= 1;
      this.currentAttackPower += 1;
    } else if (this.currentAttackPower > 0) {
      this.releaseKiAttack();
    }
  }

  releaseKiAttack() {
    // Calculate direction vector
    let targetPlayer = this === player1 ? player2 : player1;
    let dx = targetPlayer.x - this.x;
    let dy = targetPlayer.y - this.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);
    dx /= magnitude;
    dy /= magnitude;

    this.projectiles.push({
      x: this.x,
      y: this.y,
      size: this.currentAttackPower,
      color: this.spirit,
      speedX: dx * 5, // Adjust the multiplier for desired speed
      speedY: dy * 5,  // Adjust the multiplier for desired speed
      damage: this.currentAttackPower
    });
    this.currentAttackPower = 0;
  }

  toggleFlying() {
    if (this.canFly && this.flyToggleCooldown == 0) {
      this.isFlying = !this.isFlying;
      this.flyToggleCooldown = 20; // Cooldown to prevent immediate retriggering
    }
  }

  checkGrounded() {
    if (this.y >= 340) {
      this.y = 340;
      this.velocityY = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
  }

  jump() {
    if (this.grounded) {
      this.velocityY = -jumpForce;
      this.grounded = false;
    }
  }

  checkCollisions() {
    let targetPlayer = this === player1 ? player2 : player1;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let projectile = this.projectiles[i];
      if (
        projectile.x > targetPlayer.x &&
        projectile.x < targetPlayer.x + 10 &&
        projectile.y > targetPlayer.y &&
        projectile.y < targetPlayer.y + 10
      ) {
        targetPlayer.health -= projectile.damage;
        this.projectiles.splice(i, 1);
      }
    }
  }
}

let player1 = new Player(0, 200, 88, 67); // 'X' and 'C' keys
let player2 = new Player(300, 200, 78, 66); // 'N' and 'B' keys

let lastUpPressTime = 0;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  for (let i = 0; i < 10; i++) {
    clouds.push({ x: random(-100, 300), y: random(0, 250) });
  }
  setInterval(() => {
    if (timer > 0) timer--;
  }, 1000);
}

function restartClouds() {
  for (let i = 0; i < clouds.length; i++) {
    if (clouds[i].x + delta > 600) {
      clouds[i].x = random(-70, 5);
      clouds[i].y = random(-2, 300);
    }
  }
}

function draw() {
  background(10, 100, 220); // This sets the background color each frame
  
  fill(255);
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x += random(0, 0.5); // Adjusting cloud speed
    ellipse(clouds[i].x, clouds[i].y, 80, 40);
  }
  
  for (let i = 0; i < player1.projectiles.length; i++) {
    fill(player1.projectiles[i].color);
    ellipse(player1.projectiles[i].x, player1.projectiles[i].y, player1.projectiles[i].size, player1.projectiles[i].size);
    player1.projectiles[i].x += player1.projectiles[i].speedX;
    player1.projectiles[i].y += player1.projectiles[i].speedY;
  }

  for (let i = 0; i < player2.projectiles.length; i++) {
    fill(player2.projectiles[i].color);
    ellipse(player2.projectiles[i].x, player2.projectiles[i].y, player2.projectiles[i].size, player2.projectiles[i].size);
    player2.projectiles[i].x += player2.projectiles[i].speedX;
    player2.projectiles[i].y += player2.projectiles[i].speedY;
  }

  player1.update();
  player1.draw();
  player1.checkCollisions();

  player2.update();
  player2.draw();
  player2.checkCollisions();
  
  //ground
  fill(0, 100, 0);
  rect(0, 350, 400, 50);
  
  //UI
  //player1 health
  fill(10, 10, 10);
  rect(0, 20, player1.maxHealth, 10);
  fill(200, 0, 0);
  rect(0, 20, player1.health, 10);

  //player1 ki 
  fill(10, 10, 10);
  rect(0, 50, player1.maxKi, 10);
  fill(10, 0, 200);
  rect(0, 50, player1.ki, 10);

  //player2 health
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxHealth, 20, player2.maxHealth, 10);
  fill(200, 0, 0);
  rect(canvasWidth - player2.health, 20, player2.health, 10);

  //player2 ki
  fill(10, 10, 10);
  rect(canvasWidth - player2.maxKi, 50, player2.maxKi, 10);
  fill(10, 0, 200);
  rect(canvasWidth - player2.ki, 50, player2.ki, 10);

  // Timer
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(timer, canvasWidth / 2, 30);

  restartClouds();
}

function keyPressed() {
  const currentTime = millis();
  if (keyCode === UP_ARROW) {
    if (currentTime - lastUpPressTime < 300) { // 300 ms for double press detection
      player1.toggleFlying();
    } else {
      player1.jump(); // Single press to jump
    }
    lastUpPressTime = currentTime;
  }
}
