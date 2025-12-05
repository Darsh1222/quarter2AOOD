const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game states
const STATE_MENU = 'menu';
const STATE_LEVEL_SELECT = 'levelSelect';
const STATE_PLAYING = 'playing';

let gameState = STATE_MENU;

// Themes
const themes = {
    default: {
        bg: '#0f0f1e',
        ground: '#16213e',
        obstacle: '#ff6b6b',
        player: '#00ff00'
    },
    tax: {
        bg: '#1a1a1a',
        ground: '#2d2d2d',
        obstacle: '#ff4444',
        player: '#00ccff'
    },
    geo: {
        bg: '#0a0a2e',
        ground: '#16213e',
        obstacle: '#ff6b6b',
        player: '#00ff88'
    }
};

let currentTheme = themes.default;

// Levels
const levels = [
    { name: 'Stereo Maxness', theme: 'default', mode: 'square' }
];

let selectedLevel = 0;

// Game variables
let gameSpeed = 6;
let baseSpeed = 6;
let score = 0;
const groundY = canvas.height - 100;

// Player
const player = {
    x: 150,
    y: groundY - 30,
    size: 30,
    velocityY: 0,
    gravity: 1.5,
    jumpPower: -12,
    rotation: 0,
    onGround: false
};

// Obstacles array
let obstacles = [];

// Power-ups
let powerUps = [];
let slowDownActive = false;
let slowDownTimer = 0;

// Initialize game
function init() {
    // Event listeners
    canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);
    
    // Start game loop
    gameLoop();
}

// Start game
function startGame() {
    gameState = STATE_PLAYING;
    const level = levels[selectedLevel];
    currentTheme = themes[level.theme] || themes.default;
    
    // Reset game
    player.y = groundY - 30;
    player.velocityY = 0;
    player.rotation = 0;
    obstacles = [];
    powerUps = [];
    score = 0;
    baseSpeed = 6;
    gameSpeed = baseSpeed;
    slowDownActive = false;
    
    // Create initial obstacles for Stereo Maxness with variety
    createObstacle(600);
    createObstacle(1000);
    createObstacle(1400);
    createObstacle(1800);
    createObstacle(2200);
    
    // Create power-up
    createPowerUp(800);
}

// Create obstacle with variety
function createObstacle(x) {
    const types = ['ground', 'ground', 'ground', 'floating', 'tall'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let obstacle = {
        x: x,
        width: 40,
        height: 40,
        type: 'block'
    };
    
    if (type === 'ground') {
        // Normal ground obstacle
        obstacle.y = groundY;
        obstacle.height = 40;
    } else if (type === 'tall') {
        // Tall ground obstacle
        obstacle.y = groundY;
        obstacle.height = 60;
    } else if (type === 'floating') {
        // Floating obstacle above ground
        obstacle.y = groundY - 80;
        obstacle.height = 40;
    }
    
    obstacles.push(obstacle);
}

// Create power-up
function createPowerUp(x) {
    powerUps.push({
        x: x,
        y: groundY - 60,
        size: 25,
        type: 'slowDown'
    });
}

// Handle click
function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (gameState === STATE_MENU) {
        if (x >= 300 && x <= 500 && y >= 350 && y <= 400) {
            gameState = STATE_LEVEL_SELECT;
        }
    } else if (gameState === STATE_LEVEL_SELECT) {
        if (x >= 300 && x <= 500 && y >= 250 && y <= 300) {
            selectedLevel = 0;
            startGame();
        }
    } else if (gameState === STATE_PLAYING) {
        // Jump on click
        if (player.onGround) {
            player.velocityY = player.jumpPower;
            player.onGround = false;
        }
    }
}

// Handle key press
function handleKeyPress(e) {
    if (gameState === STATE_PLAYING && e.code === 'Space') {
        e.preventDefault();
        if (player.onGround) {
            player.velocityY = player.jumpPower;
            player.onGround = false;
        }
    }
}

// Draw menu
function drawMenu() {
    // Background
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GEO TAX FLASH 2', canvas.width / 2, 200);
    
    // Play button
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(300, 350, 200, 50);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('PLAY', canvas.width / 2, 385);
}

// Draw level select
function drawLevelSelect() {
    // Background
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT LEVEL', canvas.width / 2, 150);
    
    // Level button
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(300, 250, 200, 50);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Stereo Maxness', canvas.width / 2, 285);
}

// Update game state
function update() {
    if (gameState !== STATE_PLAYING) return;
    
    // Gradually increase speed based on score (but not during slow down)
    if (!slowDownActive) {
        baseSpeed = 6 + Math.floor(score / 10) * 0.5; // Speed increases every 10 points
        gameSpeed = baseSpeed;
    }
    
    // Update slow down power-up (only affects obstacle/power-up movement, not player physics)
    if (slowDownActive) {
        slowDownTimer--;
        if (slowDownTimer <= 0) {
            slowDownActive = false;
            gameSpeed = baseSpeed;
        }
    }
    
    // Update player (player physics are independent of gameSpeed - jump and gravity stay constant)
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Rotate player
    player.rotation += 0.5;
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            // Create new obstacle with varied spacing
            if (obstacles.length < 5) {
                const lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : 600;
                const spacing = 300 + Math.random() * 200; // Varied spacing between 300-500
                createObstacle(lastX + spacing);
            }
        } else {
            // Collision detection
            if (checkCollision(player, obstacles[i])) {
                resetGame();
            }
        }
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].x -= gameSpeed;
        
        // Check collision with power-up
        if (checkPowerUpCollision(player, powerUps[i])) {
            if (powerUps[i].type === 'slowDown') {
                slowDownActive = true;
                slowDownTimer = 300; // 5 seconds at 60fps
                gameSpeed = baseSpeed * 0.5;
            }
            powerUps.splice(i, 1);
        } else if (powerUps[i].x + powerUps[i].size < 0) {
            powerUps.splice(i, 1);
            // Create new power-up
            if (powerUps.length === 0) {
                const lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : 600;
                createPowerUp(lastX + 500);
            }
        }
    }
}

// Check collision
function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.size > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.size > obstacle.y;
}

// Check power-up collision
function checkPowerUpCollision(player, powerUp) {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const powerUpCenterX = powerUp.x + powerUp.size / 2;
    const powerUpCenterY = powerUp.y + powerUp.size / 2;
    
    const distance = Math.sqrt(
        Math.pow(playerCenterX - powerUpCenterX, 2) +
        Math.pow(playerCenterY - powerUpCenterY, 2)
    );
    
    return distance < (player.size / 2 + powerUp.size / 2);
}

    // Reset game
function resetGame() {
    gameState = STATE_LEVEL_SELECT;
    player.y = groundY - 30;
    player.velocityY = 0;
    obstacles = [];
    powerUps = [];
    score = 0;
    baseSpeed = 6;
    gameSpeed = baseSpeed;
    slowDownActive = false;
}

// Draw player
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.rotation);
    ctx.fillStyle = currentTheme.player;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.restore();
}

// Draw gameplay
function drawGame() {
    // Clear canvas
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = currentTheme.ground;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Draw obstacles
    ctx.fillStyle = currentTheme.obstacle;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw power-ups
    powerUps.forEach(powerUp => {
        if (powerUp.type === 'slowDown') {
            ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.arc(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, powerUp.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Draw player
    drawPlayer();
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 20, 40);
    
    // Draw slow down indicator
    if (slowDownActive) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '20px Arial';
        ctx.fillText('SLOW DOWN!', 20, 70);
    }
}

// Draw function
function draw() {
    if (gameState === STATE_MENU) {
        drawMenu();
    } else if (gameState === STATE_LEVEL_SELECT) {
        drawLevelSelect();
    } else if (gameState === STATE_PLAYING) {
        drawGame();
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
init();

