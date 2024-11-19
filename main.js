const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ship;
let asteroids;
let gameOver = false;
const numAsteroids = 5;
const minSpeed = 1; // Minimum speed for asteroids
const button = {
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 + 40,
    width: 100,
    height: 40,
    text: "Play Again",
    visible: false
};

function createAsteroid(x, y, radius) {
    let dx = Math.random() * 4 - 2;
    let dy = Math.random() * 4 - 2;

    // Ensure the asteroid has a minimum speed
    while (Math.sqrt(dx * dx + dy * dy) < minSpeed) {
        dx = Math.random() * 4 - 2;
        dy = Math.random() * 4 - 2;
    }

    return {
        x: x,
        y: y,
        radius: radius,
        angle: Math.random() * Math.PI * 2,
        dx: dx,
        dy: dy
    };
}

function resetGame() {
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 15,
        angle: 0,
        rotation: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        },
        bullets: []
    };

    asteroids = [];
    for (let i = 0; i < numAsteroids; i++) {
        asteroids.push(createAsteroid(Math.random() * canvas.width, Math.random() * canvas.height, 15)); // Adjusted radius from 30 to 15
    }

    gameOver = false;
    button.visible = false;
}

function drawCounter() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Asteroids Left: ${asteroids.length}`, 10, 30);
}


function displayMessage(message) {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);

    gameOver = true;
    button.visible = true;
    drawButton();
}

function drawButton() {
    if (button.visible) {
        ctx.fillStyle = 'white';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 7);
    }
}

canvas.addEventListener('click', (event) => {
    if (button.visible) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= button.x && mouseY >= button.y && mouseX <= button.x + button.width && mouseY <= button.y + button.height) {
            resetGame();
            update();
        }
    }
});

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(event) {
    switch(event.keyCode) {
        case 37: // left arrow (rotate left)
            ship.rotation = -0.05; // Adjusted rotation speed
            break;
        case 38: // up arrow (thrust forward)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rotate right)
            ship.rotation = 0.05; // Adjusted rotation speed
            break;
        case 32: // space bar (shoot)
            ship.bullets.push({
                x: ship.x + 4 / 3 * ship.radius * Math.cos(ship.angle),
                y: ship.y - 4 / 3 * ship.radius * Math.sin(ship.angle),
                dx: 5 * Math.cos(ship.angle),
                dy: -5 * Math.sin(ship.angle)
            });
            break;
    }
}

function keyUp(event) {
    switch(event.keyCode) {
        case 37: // left arrow (stop rotating left)
            ship.rotation = 0;
            break;
        case 38: // up arrow (stop thrusting)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rotation = 0;
            break;
    }
}

function collisionDetection(bullet, asteroid) {
    const distX = bullet.x - asteroid.x;
    const distY = bullet.y - asteroid.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < asteroid.radius;
}

function shipCollisionDetection(ship, asteroid) {
    const distX = ship.x - asteroid.x;
    const distY = ship.y - asteroid.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < ship.radius + asteroid.radius;
}

function update() {
    if (gameOver) return;

    // Rotate the ship
    ship.angle += ship.rotation;

    // Thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += 0.05 * Math.cos(ship.angle);
        ship.thrust.y += 0.05 * Math.sin(ship.angle);
    } else {
        ship.thrust.x *= 0.99;
        ship.thrust.y *= 0.99;
    }

    // Move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Handle edge of screen
    if (ship.x < 0) {
        ship.x = canvas.width;
    } else if (ship.x > canvas.width) {
        ship.x = 0;
    }
    if (ship.y < 0) {
        ship.y = canvas.height;
    } else if (ship.y > canvas.height) {
        ship.y = 0;
    }

    // Move the bullets
    for (let i = 0; i < ship.bullets.length; i++) {
        ship.bullets[i].x += ship.bullets[i].dx;
        ship.bullets[i].y += ship.bullets[i].dy;

        // Remove bullets that go off screen
        if (ship.bullets[i].x < 0 || ship.bullets[i].x > canvas.width || ship.bullets[i].y < 0 || ship.bullets[i].y > canvas.height) {
            ship.bullets.splice(i, 1);
            i--;
        }
    }

    // Move the asteroids
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].dx;
        asteroids[i].y += asteroids[i].dy;

        // Handle edge of screen for asteroids
        if (asteroids[i].x < 0) {
            asteroids[i].x = canvas.width;
        } else if (asteroids[i].x > canvas.width) {
            asteroids[i].x = 0;
        }
        if (asteroids[i].y < 0) {
            asteroids[i].y = canvas.height;
        } else if (asteroids[i].y > canvas.height) {
            asteroids[i].y = 0;
        }
    }

    // Check for bullet-asteroid collisions
    for (let i = 0; i < ship.bullets.length; i++) {
        for (let j = 0; j < asteroids.length; j++) {
            if (collisionDetection(ship.bullets[i], asteroids[j])) {
                ship.bullets.splice(i, 1);
                asteroids.splice(j, 1);
                i--;
                break;
            }
        }
    }

    // Check for ship-asteroid collisions
    for (let i = 0; i < asteroids.length; i++) {
        if (shipCollisionDetection(ship, asteroids[i])) {
            displayMessage("Game Over!");
            return; // End the game loop
        }
    }

    // Draw the space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the ship
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + 4 / 3 * ship.radius * Math.cos(ship.angle),
        ship.y - 4 / 3 * ship.radius * Math.sin(ship.angle)
    );
    ctx.lineTo(
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo(
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath();
    ctx.stroke();

    // Draw the bullets
    for (let i = 0; i < ship.bullets.length; i++) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ship.bullets[i].x, ship.bullets[i].y, 5, 0, Math.PI * 2, false); // Increased radius from 2 to 5
        ctx.fill();
    }

    // Draw the asteroids
    for (let i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // Draw the counter
    drawCounter();

    // Check for win condition
    if (asteroids.length === 0) {
        displayMessage("You Win!");
        return; // End the game loop
    }
    requestAnimationFrame(update);
}

// Initialize the game
resetGame();
update();
