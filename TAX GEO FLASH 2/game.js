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
let gameSpeed = 8; // Increased base speed
let baseSpeed = 8;
let score = 0;
const groundY = canvas.height - 100;

// Player
const player = {
    x: 150,
    y: groundY - 30,
    size: 30,
    velocityY: 0,
    gravity: 1.5,
    jumpPower: -18, // Increased jump height
    rotation: 0,
    onGround: false
};

// Obstacles array
let obstacles = [];

// Power-ups
let powerUps = [];
let slowDownActive = false;
let slowDownTimer = 0;

// Collectibles (coins)
let coins = [];
let coinsCollected = 0;

// Platforms (blue blocks you can jump on)
let platforms = [];

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
    coins = [];
    platforms = [];
    score = 0;
    coinsCollected = 0;
    baseSpeed = 8; // Increased base speed (HARDER)
    gameSpeed = baseSpeed;
    slowDownActive = false;
    
    
    createPlatform(600, groundY - 100, 80);
    createPlatform(750, groundY - 120, 70);
    createPlatform(900, groundY - 110, 80);
    createPlatform(1050, groundY - 130, 90);
    createPlatform(1200, groundY - 100, 70);
    createPlatform(1350, groundY - 140, 80);
    createPlatform(1500, groundY - 115, 75);
    createPlatform(1650, groundY - 125, 85);
    createPlatform(1800, groundY - 110, 70);
    createPlatform(1950, groundY - 135, 80);
    createPlatform(2100, groundY - 120, 90);
    createPlatform(2250, groundY - 105, 75);
    createPlatform(2400, groundY - 130, 80);
    createPlatform(2550, groundY - 115, 85);
    
    // Add MORE floating spikes as threats between platforms (HARDER)
    createFloatingSpike(700, groundY - 80);
    createFloatingSpike(725, groundY - 50); // Extra spike
    createFloatingSpike(850, groundY - 60);
    createFloatingSpike(875, groundY - 90); // Extra spike
    createFloatingSpike(1000, groundY - 90);
    createFloatingSpike(1025, groundY - 70); // Extra spike
    createFloatingSpike(1150, groundY - 70);
    createFloatingSpike(1300, groundY - 100);
    createFloatingSpike(1325, groundY - 75); // Extra spike
    createFloatingSpike(1450, groundY - 85);
    createFloatingSpike(1600, groundY - 75);
    createFloatingSpike(1625, groundY - 100); // Extra spike
    createFloatingSpike(1750, groundY - 95);
    createFloatingSpike(1900, groundY - 65);
    createFloatingSpike(1925, groundY - 90); // Extra spike
    createFloatingSpike(2050, groundY - 110);
    createFloatingSpike(2200, groundY - 80);
    createFloatingSpike(2225, groundY - 60); // Extra spike
    createFloatingSpike(2350, groundY - 100);
    createFloatingSpike(2375, groundY - 75); // Extra spike
    
    // Add some ground obstacles
    createObstacle(800);
    createObstacle(1400);
    createObstacle(2000);
    
    // Add coins
    createCoin(650, groundY - 150);
    createCoin(1100, groundY - 160);
    createCoin(1550, groundY - 150);
    createCoin(2000, groundY - 155);
    
    // Create power-up
    createPowerUp(800);
}

// Create obstacle with variety
function createObstacle(x) {
    const types = ['ground', 'ground', 'ground', 'floating', 'tall', 'spike', 'moving', 'ceiling', 'wide', 'low', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let obstacle = {
        x: x,
        width: 40,
        height: 40,
        type: 'block',
        moving: false,
        moveDirection: 1,
        moveSpeed: 0
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
    } else if (type === 'spike') {
        // Spike obstacle (triangular) - can be ground or floating
        if (Math.random() > 0.4) {
            // Floating spike above ground (threat!)
            obstacle.y = groundY - (60 + Math.random() * 120); // 60-180px above ground
            obstacle.height = 30;
            obstacle.width = 30;
            obstacle.type = 'spike';
            obstacle.floating = true;
        } else {
            // Ground spike
            obstacle.y = groundY;
            obstacle.height = 30;
            obstacle.width = 30;
            obstacle.type = 'spike';
        }
    } else if (type === 'moving') {
        // Moving obstacle that goes up and down
        obstacle.y = groundY - 40;
        obstacle.height = 40;
        obstacle.moving = true;
        obstacle.moveSpeed = 2;
        obstacle.originalY = obstacle.y;
    } else if (type === 'ceiling') {
        // Ceiling spike (hanging from top)
        obstacle.y = 50;
        obstacle.height = 30;
        obstacle.width = 30;
        obstacle.type = 'spike';
        obstacle.ceiling = true;
    } else if (type === 'wide') {
        // Wide ground obstacle
        obstacle.y = groundY;
        obstacle.width = 60;
        obstacle.height = 40;
    } else if (type === 'low') {
        // Low floating obstacle (must duck under)
        obstacle.y = groundY - 40;
        obstacle.height = 20;
        obstacle.width = 50;
    } else if (type === 'double') {
        // Double obstacle (ground + floating)
        obstacle.y = groundY;
        obstacle.height = 40;
        obstacles.push({...obstacle});
        // Add floating one above
        obstacle.y = groundY - 100;
        obstacle.height = 40;
    }
    
    obstacles.push(obstacle);
}

// Create coin
function createCoin(x, y) {
    coins.push({
        x: x,
        y: y || groundY - 50,
        size: 15,
        collected: false
    });
}

// Create platform (blue block you can jump on)
function createPlatform(x, y, width = 60) {
    platforms.push({
        x: x,
        y: y,
        width: width,
        height: 20,
        type: 'platform'
    });
}

// Create floating spike (threat above ground)
function createFloatingSpike(x, y) {
    obstacles.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        type: 'spike',
        floating: true
    });
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
    
    // Gradually increase speed based on score (but not during slow down) - HARDER
    if (!slowDownActive) {
        baseSpeed = 8 + Math.floor(score / 5) * 0.8; // Speed increases faster (every 5 points, +0.8)
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
    
    // Platform collision (can land on top, pass through from below)
    player.onGround = false;
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        // Check if player is above platform and falling
        if (player.velocityY >= 0 && 
            player.x < platform.x + platform.width &&
            player.x + player.size > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.size > platform.y) {
            // Land on top of platform
            player.y = platform.y - player.size;
            player.velocityY = 0;
            player.onGround = true;
            break;
        }
    }
    
    // Ground collision
    if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Ceiling collision
    if (player.y <= 0) {
        player.y = 0;
        player.velocityY = 0;
    }
    
    // Rotate player
    player.rotation += 0.5;
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        
        // Handle moving obstacles
        if (obstacles[i].moving) {
            obstacles[i].y += obstacles[i].moveSpeed * obstacles[i].moveDirection;
            // Bounce between original position and original position + 60
            if (obstacles[i].y >= obstacles[i].originalY + 60 || obstacles[i].y <= obstacles[i].originalY - 60) {
                obstacles[i].moveDirection *= -1;
            }
        }
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            // Create new obstacle with varied spacing (HARDER - more obstacles, tighter spacing)
            if (obstacles.length < 10) {
                const lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : 600;
                const spacing = 150 + Math.random() * 100; // Tighter spacing: 150-250 (was 200-350)
                createObstacle(lastX + spacing);
                // More obstacle clusters (HARDER)
                if (Math.random() > 0.5) { // 50% chance (was 30%)
                    createObstacle(lastX + spacing + 80);
                }
                // Add platforms frequently (platforming focused level)
                if (platforms.length < 6) {
                    // Create platform sequence
                    const platformY = groundY - (90 + Math.random() * 90); // 90-180px above ground
                    createPlatform(lastX + spacing - 50, platformY, 70 + Math.random() * 30);
                    
                    // Sometimes add another platform close by for platforming chain
                    if (Math.random() > 0.3) { // More platforms (was 0.4)
                        const nextPlatformY = groundY - (100 + Math.random() * 80);
                        createPlatform(lastX + spacing + 80, nextPlatformY, 70 + Math.random() * 30);
                    }
                    
                    // More floating spikes as threats (HARDER)
                    if (Math.random() > 0.5) { // 50% chance (was 70%)
                        const spikeY = platformY - (20 + Math.random() * 50);
                        createFloatingSpike(lastX + spacing + 40, spikeY);
                    }
                }
                // Sometimes add a coin near the obstacle
                if (Math.random() > 0.6) {
                    createCoin(lastX + spacing - 50, groundY - 50);
                }
            }
        } else {
            // Collision detection
            if (checkCollision(player, obstacles[i])) {
                resetGame();
            }
        }
    }
    
    // Update platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
        platforms[i].x -= gameSpeed;
        
        // Remove off-screen platforms
        if (platforms[i].x + platforms[i].width < 0) {
            platforms.splice(i, 1);
            // Create new platforms frequently (keep platforming chain going)
            if (platforms.length < 6) {
                const lastX = platforms.length > 0 ? platforms[platforms.length - 1].x : obstacles.length > 0 ? obstacles[obstacles.length - 1].x : 600;
                const spacing = 100 + Math.random() * 60; // Tighter spacing for platforming (HARDER)
                // Place platforms at reachable heights (90-180px above ground)
                const platformY = groundY - (90 + Math.random() * 90);
                createPlatform(lastX + spacing, platformY, 70 + Math.random() * 30);
                
                // Sometimes add floating spike threat
                if (Math.random() > 0.5) {
                    const spikeY = platformY - (20 + Math.random() * 50);
                    createFloatingSpike(lastX + spacing + 30, spikeY);
                }
            }
        }
    }
    
    // Update coins
    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].x -= gameSpeed;
        
        // Check coin collection
        if (!coins[i].collected && checkCoinCollision(player, coins[i])) {
            coins[i].collected = true;
            coinsCollected++;
            score += 5; // Bonus points for coins
            coins.splice(i, 1);
        } else if (coins[i].x + coins[i].size < 0) {
            coins.splice(i, 1);
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
    if (obstacle.type === 'spike') {
        // Simplified spike collision - use bounding box for reliability
        // Check if player rectangle overlaps with spike bounding box
        const playerLeft = player.x;
        const playerRight = player.x + player.size;
        const playerTop = player.y;
        const playerBottom = player.y + player.size;
        
        const spikeLeft = obstacle.x;
        const spikeRight = obstacle.x + obstacle.width;
        const spikeTop = obstacle.y;
        const spikeBottom = obstacle.y + obstacle.height;
        
        // Check bounding box collision
        if (playerRight > spikeLeft && playerLeft < spikeRight &&
            playerBottom > spikeTop && playerTop < spikeBottom) {
            // For spikes, check if player center is within the triangle area
            const playerCenterX = player.x + player.size / 2;
            const playerCenterY = player.y + player.size / 2;
            
            if (obstacle.ceiling) {
                // Ceiling spike - point down
                const relativeX = (playerCenterX - spikeLeft) / obstacle.width;
                const triangleY = spikeTop + (relativeX * obstacle.height);
                if (playerCenterY < triangleY + obstacle.height) {
                    return true;
                }
            } else {
                // Ground or floating spike - point up
                const relativeX = (playerCenterX - spikeLeft) / obstacle.width;
                const triangleY = spikeTop + obstacle.height - (relativeX * obstacle.height);
                if (playerCenterY > triangleY - 10) { // More forgiving detection
                    return true;
                }
            }
        }
        return false;
    } else {
        // Regular rectangular collision
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.size > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.size > obstacle.y;
    }
}

// Check coin collision
function checkCoinCollision(player, coin) {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const coinCenterX = coin.x + coin.size / 2;
    const coinCenterY = coin.y + coin.size / 2;
    
    const distance = Math.sqrt(
        Math.pow(playerCenterX - coinCenterX, 2) +
        Math.pow(playerCenterY - coinCenterY, 2)
    );
    
    return distance < (player.size / 2 + coin.size / 2);
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

    // Reset game (restart the level)
function resetGame() {
    // Restart the game instead of going to level select
    const level = levels[selectedLevel];
    currentTheme = themes[level.theme] || themes.default;
    
    // Reset player
    player.y = groundY - 30;
    player.velocityY = 0;
    player.rotation = 0;
    
    // Clear all objects
    obstacles = [];
    powerUps = [];
    coins = [];
    platforms = [];
    
    // Reset game state
    score = 0;
    coinsCollected = 0;
    baseSpeed = 8; // Increased base speed (HARDER)
    gameSpeed = baseSpeed;
    slowDownActive = false;
    
    // Recreate initial level with lots of blue platforms (platforming focused)
    // Start with platforms in sequence
    createPlatform(600, groundY - 100, 80);
    createPlatform(750, groundY - 120, 70);
    createPlatform(900, groundY - 110, 80);
    createPlatform(1050, groundY - 130, 90);
    createPlatform(1200, groundY - 100, 70);
    createPlatform(1350, groundY - 140, 80);
    createPlatform(1500, groundY - 115, 75);
    createPlatform(1650, groundY - 125, 85);
    createPlatform(1800, groundY - 110, 70);
    createPlatform(1950, groundY - 135, 80);
    createPlatform(2100, groundY - 120, 90);
    createPlatform(2250, groundY - 105, 75);
    createPlatform(2400, groundY - 130, 80);
    createPlatform(2550, groundY - 115, 85);
    
    // Add MORE floating spikes as threats between platforms (HARDER)
    createFloatingSpike(700, groundY - 80);
    createFloatingSpike(725, groundY - 50); // Extra spike
    createFloatingSpike(850, groundY - 60);
    createFloatingSpike(875, groundY - 90); // Extra spike
    createFloatingSpike(1000, groundY - 90);
    createFloatingSpike(1025, groundY - 70); // Extra spike
    createFloatingSpike(1150, groundY - 70);
    createFloatingSpike(1300, groundY - 100);
    createFloatingSpike(1325, groundY - 75); // Extra spike
    createFloatingSpike(1450, groundY - 85);
    createFloatingSpike(1600, groundY - 75);
    createFloatingSpike(1625, groundY - 100); // Extra spike
    createFloatingSpike(1750, groundY - 95);
    createFloatingSpike(1900, groundY - 65);
    createFloatingSpike(1925, groundY - 90); // Extra spike
    createFloatingSpike(2050, groundY - 110);
    createFloatingSpike(2200, groundY - 80);
    createFloatingSpike(2225, groundY - 60); // Extra spike
    createFloatingSpike(2350, groundY - 100);
    createFloatingSpike(2375, groundY - 75); // Extra spike
    
    // Add some ground obstacles
    createObstacle(800);
    createObstacle(1400);
    createObstacle(2000);
    
    // Add coins
    createCoin(650, groundY - 150);
    createCoin(1100, groundY - 160);
    createCoin(1550, groundY - 150);
    createCoin(2000, groundY - 155);
    
    // Create power-up
    createPowerUp(800);
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
    
    // Draw platforms (blue blocks you can jump on)
    platforms.forEach(platform => {
        ctx.fillStyle = '#0066ff'; // Blue color
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeStyle = '#003399';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw obstacles (RED = DEADLY - will kill you!)
    ctx.fillStyle = currentTheme.obstacle; // Red color
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'spike') {
            // Draw triangular spike
            ctx.beginPath();
            if (obstacle.ceiling) {
                // Ceiling spike (pointing down)
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x, obstacle.y);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
            } else {
                // Ground spike (pointing up)
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
                ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Draw regular rectangular obstacle
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
    
    // Draw coins
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.size / 2, coin.y + coin.size / 2, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
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
    ctx.fillText('Coins: ' + coinsCollected, 20, 65);
    
    // Draw slow down indicator
    if (slowDownActive) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '20px Arial';
        ctx.fillText('SLOW DOWN!', 20, 90);
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

