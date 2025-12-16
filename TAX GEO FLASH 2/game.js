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
let gameSpeed = 4;
let baseSpeed = 4;
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
    onGround: false,
    canDoubleJump: false,
    hasDoubleJumped: false
};

// Obstacles array
let obstacles = [];

// Power-ups
let powerUps = [];
let slowDownActive = false;
let slowDownTimer = 0;
let doubleJumpActive = false;
let doubleJumpTimer = 0;

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
    baseSpeed = 4; 
    gameSpeed = baseSpeed;
    slowDownActive = false;
    doubleJumpActive = false;
    player.hasDoubleJumped = false;
    
    
    // Constructed level - platforms as main path with obstacles positioned around them
    // Section 1: Starting platforms
    createPlatform(600, groundY - 100, 90);
    createPlatform(750, groundY - 120, 80);
    createPlatform(900, groundY - 110, 90);
    
    // Spikes between first platforms (positioned relative to platform heights)
    createFloatingSpike(720, groundY - 60); // Between platform 1 and 2
    createFloatingSpike(870, groundY - 70); // Between platform 2 and 3
    
    // Section 2: Higher platforms with double jump power-up ON platform
    createPlatform(1100, groundY - 140, 100);
    createDoubleJumpPowerUp(1140, groundY - 170); // ON the platform (above it)
    createFloatingSpike(1050, groundY - 80); // Threat below
    createFloatingSpike(1250, groundY - 90); // Threat after platform
    
    createPlatform(1350, groundY - 130, 80);
    createPlatform(1500, groundY - 150, 90);
    createFloatingSpike(1420, groundY - 100); // Between platforms
    
    // Section 3: Gap section requiring double jump
    createPlatform(1700, groundY - 160, 85);
    createFloatingSpike(1650, groundY - 110); // Threat before gap
    createFloatingSpike(1750, groundY - 120); // Threat in gap
    createPlatform(1900, groundY - 140, 90);
    createDoubleJumpPowerUp(1940, groundY - 170); // ON the platform
    
    // Section 4: Mixed height platforms
    createPlatform(2100, groundY - 120, 80);
    createFloatingSpike(2050, groundY - 80);
    createPlatform(2250, groundY - 140, 100);
    createFloatingSpike(2200, groundY - 100);
    createPlatform(2400, groundY - 130, 85);
    
    // Section 5: Final challenging section
    createPlatform(2550, groundY - 150, 90);
    createDoubleJumpPowerUp(2590, groundY - 180); // ON the platform
    createFloatingSpike(2500, groundY - 110);
    createFloatingSpike(2650, groundY - 120);
    
    createPlatform(2750, groundY - 140, 80);
    createFloatingSpike(2700, groundY - 100);
    createPlatform(2900, groundY - 160, 100);
    createFloatingSpike(2850, groundY - 120);
    
    // Add coins positioned near platforms
    createCoin(630, groundY - 130);
    createCoin(1130, groundY - 170);
    createCoin(1520, groundY - 180);
    createCoin(1920, groundY - 170);
    createCoin(2280, groundY - 170);
    createCoin(2580, groundY - 180);
    
    // Slow down power-up (ground level)
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

// Create double jump power-up (can specify position)
function createDoubleJumpPowerUp(x, y) {
    powerUps.push({
        x: x,
        y: y || groundY - 60,
        size: 25,
        type: 'doubleJump'
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
            player.hasDoubleJumped = false;
        } else if (doubleJumpActive && !player.hasDoubleJumped) {
            // Double jump
            player.velocityY = player.jumpPower;
            player.hasDoubleJumped = true;
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
            player.hasDoubleJumped = false;
        } else if (doubleJumpActive && !player.hasDoubleJumped) {
            // Double jump
            player.velocityY = player.jumpPower;
            player.hasDoubleJumped = true;
        }
    }
}

// Draw menu
function drawMenu() {
    // Animated gradient background
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 20}, 70%, 15%)`);
    gradient.addColorStop(0.5, `hsl(${280 + Math.cos(time) * 20}, 70%, 12%)`);
    gradient.addColorStop(1, `hsl(${260 + Math.sin(time * 0.7) * 20}, 70%, 10%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Title with glow effect
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GEO TAX FLASH 2', canvas.width / 2, 200);
    ctx.shadowBlur = 0;
    
    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Geometry Dash Style Platformer', canvas.width / 2, 240);
    
    // Play button with gradient and glow
    const buttonX = 300;
    const buttonY = 350;
    const buttonW = 200;
    const buttonH = 60;
    
    // Button shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(buttonX + 4, buttonY + 4, buttonW, buttonH);
    
    // Button gradient
    const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonH);
    buttonGradient.addColorStop(0, '#00ff88');
    buttonGradient.addColorStop(1, '#00cc66');
    ctx.fillStyle = buttonGradient;
    ctx.fillRect(buttonX, buttonY, buttonW, buttonH);
    
    // Button border
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonW, buttonH);
    
    // Button text with glow
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.fillText('PLAY', canvas.width / 2, buttonY + 42);
    ctx.shadowBlur = 0;
}

// Draw level select
function drawLevelSelect() {
    // Animated gradient background
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 20}, 70%, 15%)`);
    gradient.addColorStop(0.5, `hsl(${280 + Math.cos(time) * 20}, 70%, 12%)`);
    gradient.addColorStop(1, `hsl(${260 + Math.sin(time * 0.7) * 20}, 70%, 10%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Title with glow
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT LEVEL', canvas.width / 2, 150);
    ctx.shadowBlur = 0;
    
    // Level button with gradient
    const levelButtonX = 300;
    const levelButtonY = 250;
    const levelButtonW = 200;
    const levelButtonH = 60;
    
    // Button shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(levelButtonX + 4, levelButtonY + 4, levelButtonW, levelButtonH);
    
    // Button gradient
    const levelGradient = ctx.createLinearGradient(levelButtonX, levelButtonY, levelButtonX, levelButtonY + levelButtonH);
    levelGradient.addColorStop(0, '#667eea');
    levelGradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = levelGradient;
    ctx.fillRect(levelButtonX, levelButtonY, levelButtonW, levelButtonH);
    
    // Button border
    ctx.strokeStyle = '#8a9eff';
    ctx.lineWidth = 2;
    ctx.strokeRect(levelButtonX, levelButtonY, levelButtonW, levelButtonH);
    
    // Button text with glow
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Stereo Maxness', canvas.width / 2, levelButtonY + 40);
    ctx.shadowBlur = 0;
}

// Update game state
function update() {
    // Only update game logic when playing
    if (gameState !== STATE_PLAYING) return;
    
    // Gradually increase speed based on score (but not during slow down) - HARDER
    if (!slowDownActive) {
        baseSpeed = 4 + Math.floor(score / 10) * 0.4; // Speed increases slower (every 10 points, +0.4)
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
    
    // Update double jump power-up
    if (doubleJumpActive) {
        doubleJumpTimer--;
        if (doubleJumpTimer <= 0) {
            doubleJumpActive = false;
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
            player.hasDoubleJumped = false; // Reset double jump
            break;
        }
    }
    
    // Ground collision
    if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.onGround = true;
        player.hasDoubleJumped = false; // Reset double jump
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
            } else if (powerUps[i].type === 'doubleJump') {
                doubleJumpActive = true;
                doubleJumpTimer = 600; // 10 seconds at 60fps
                player.hasDoubleJumped = false; // Reset double jump state
            }
            powerUps.splice(i, 1);
        } else if (powerUps[i].x + powerUps[i].size < 0) {
            powerUps.splice(i, 1);
            // Create new power-up (alternate between slow down and double jump)
            if (powerUps.length < 2) {
                const lastX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : 600;
                if (Math.random() > 0.5) {
                    createPowerUp(lastX + 500);
                } else {
                    createDoubleJumpPowerUp(lastX + 500);
                }
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
    baseSpeed = 4; // Base speed
    gameSpeed = baseSpeed;
    slowDownActive = false;
    doubleJumpActive = false;
    player.hasDoubleJumped = false;
    
    // Constructed level - platforms as main path with obstacles positioned around them
    // Section 1: Starting platforms
    createPlatform(600, groundY - 100, 90);
    createPlatform(750, groundY - 120, 80);
    createPlatform(900, groundY - 110, 90);
    
    // Spikes between first platforms (positioned relative to platform heights)
    createFloatingSpike(720, groundY - 60); // Between platform 1 and 2
    createFloatingSpike(870, groundY - 70); // Between platform 2 and 3
    
    // Section 2: Higher platforms with double jump power-up ON platform
    createPlatform(1100, groundY - 140, 100);
    createDoubleJumpPowerUp(1140, groundY - 170); // ON the platform (above it)
    createFloatingSpike(1050, groundY - 80); // Threat below
    createFloatingSpike(1250, groundY - 90); // Threat after platform
    
    createPlatform(1350, groundY - 130, 80);
    createPlatform(1500, groundY - 150, 90);
    createFloatingSpike(1420, groundY - 100); // Between platforms
    
    // Section 3: Gap section requiring double jump
    createPlatform(1700, groundY - 160, 85);
    createFloatingSpike(1650, groundY - 110); // Threat before gap
    createFloatingSpike(1750, groundY - 120); // Threat in gap
    createPlatform(1900, groundY - 140, 90);
    createDoubleJumpPowerUp(1940, groundY - 170); // ON the platform
    
    // Section 4: Mixed height platforms
    createPlatform(2100, groundY - 120, 80);
    createFloatingSpike(2050, groundY - 80);
    createPlatform(2250, groundY - 140, 100);
    createFloatingSpike(2200, groundY - 100);
    createPlatform(2400, groundY - 130, 85);
    
    // Section 5: Final challenging section
    createPlatform(2550, groundY - 150, 90);
    createDoubleJumpPowerUp(2590, groundY - 180); // ON the platform
    createFloatingSpike(2500, groundY - 110);
    createFloatingSpike(2650, groundY - 120);
    
    createPlatform(2750, groundY - 140, 80);
    createFloatingSpike(2700, groundY - 100);
    createPlatform(2900, groundY - 160, 100);
    createFloatingSpike(2850, groundY - 120);
    
    // Add coins positioned near platforms
    createCoin(630, groundY - 130);
    createCoin(1130, groundY - 170);
    createCoin(1520, groundY - 180);
    createCoin(1920, groundY - 170);
    createCoin(2280, groundY - 170);
    createCoin(2580, groundY - 180);
    
    // Slow down power-up (ground level)
    createPowerUp(800);
}

// Draw player
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.rotation);
    
    // Player glow
    ctx.shadowColor = currentTheme.player;
    ctx.shadowBlur = 15;
    
    // Player gradient
    const playerGradient = ctx.createLinearGradient(-player.size / 2, -player.size / 2, player.size / 2, player.size / 2);
    playerGradient.addColorStop(0, currentTheme.player);
    playerGradient.addColorStop(1, '#00cc66');
    ctx.fillStyle = playerGradient;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    
    // Player border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);
    
    // Inner highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-player.size / 2 + 3, -player.size / 2 + 3, player.size - 6, player.size - 6);
    
    ctx.restore();
}

// Draw gameplay
function drawGame() {
    // Clear canvas
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground with gradient
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    groundGradient.addColorStop(0, currentTheme.ground);
    groundGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Ground highlight line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    
    // Draw platforms (blue blocks you can jump on) with gradient
    platforms.forEach(platform => {
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(platform.x + 2, platform.y + 2, platform.width, platform.height);
        
        // Platform gradient
        const platformGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        platformGradient.addColorStop(0, '#0099ff');
        platformGradient.addColorStop(1, '#0066cc');
        ctx.fillStyle = platformGradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform border with glow
        ctx.shadowColor = '#0099ff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        ctx.shadowBlur = 0;
        
        // Platform highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(platform.x + 1, platform.y + 1, platform.width - 2, 8);
    });
    
    // Draw obstacles (RED = DEADLY - will kill you!) with glow
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'spike') {
            // Draw triangular spike with glow
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            if (obstacle.ceiling) {
                // Ceiling spike (pointing down)
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x, obstacle.y);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
            } else {
                // Ground or floating spike (pointing up)
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
                ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
            }
            ctx.closePath();
            // Spike gradient
            const spikeGradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x + obstacle.width, obstacle.y + obstacle.height);
            spikeGradient.addColorStop(0, '#ff6666');
            spikeGradient.addColorStop(1, '#cc0000');
            ctx.fillStyle = spikeGradient;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Draw regular rectangular obstacle with gradient and glow
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 8;
            // Obstacle shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width, obstacle.height);
            // Obstacle gradient
            const obstacleGradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
            obstacleGradient.addColorStop(0, '#ff5555');
            obstacleGradient.addColorStop(1, '#cc0000');
            ctx.fillStyle = obstacleGradient;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
    
    // Draw coins with glow and animation
    const time = Date.now() * 0.005;
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinX = coin.x + coin.size / 2;
            const coinY = coin.y + coin.size / 2;
            const pulse = Math.sin(time + coin.x * 0.01) * 2;
            
            // Coin glow
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 + pulse;
            
            // Coin gradient
            const coinGradient = ctx.createRadialGradient(coinX, coinY, 0, coinX, coinY, coin.size / 2);
            coinGradient.addColorStop(0, '#ffff99');
            coinGradient.addColorStop(0.7, '#ffd700');
            coinGradient.addColorStop(1, '#ffaa00');
            ctx.fillStyle = coinGradient;
            ctx.beginPath();
            ctx.arc(coinX, coinY, coin.size / 2 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Coin highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(coinX - 3, coinY - 3, coin.size / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw power-ups with glow and animation
    const powerUpTime = Date.now() * 0.008;
    powerUps.forEach(powerUp => {
        if (powerUp.type === 'slowDown') {
            const powerUpX = powerUp.x + powerUp.size / 2;
            const powerUpY = powerUp.y + powerUp.size / 2;
            const pulse = Math.sin(powerUpTime) * 3;
            
            // Power-up glow
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 20 + pulse;
            
            // Power-up gradient
            const powerGradient = ctx.createRadialGradient(powerUpX, powerUpY, 0, powerUpX, powerUpY, powerUp.size / 2);
            powerGradient.addColorStop(0, '#88ff88');
            powerGradient.addColorStop(0.7, '#00ff00');
            powerGradient.addColorStop(1, '#00cc00');
            ctx.fillStyle = powerGradient;
            ctx.beginPath();
            ctx.arc(powerUpX, powerUpY, powerUp.size / 2 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Power-up highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(powerUpX - 4, powerUpY - 4, powerUp.size / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (powerUp.type === 'doubleJump') {
            const powerUpX = powerUp.x + powerUp.size / 2;
            const powerUpY = powerUp.y + powerUp.size / 2;
            const pulse = Math.sin(powerUpTime) * 3;
            
            // Double jump power-up glow (purple/blue)
            ctx.shadowColor = '#9966ff';
            ctx.shadowBlur = 20 + pulse;
            
            // Double jump power-up gradient
            const doubleJumpGradient = ctx.createRadialGradient(powerUpX, powerUpY, 0, powerUpX, powerUpY, powerUp.size / 2);
            doubleJumpGradient.addColorStop(0, '#cc99ff');
            doubleJumpGradient.addColorStop(0.7, '#9966ff');
            doubleJumpGradient.addColorStop(1, '#6633cc');
            ctx.fillStyle = doubleJumpGradient;
            ctx.beginPath();
            ctx.arc(powerUpX, powerUpY, powerUp.size / 2 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#bb88ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Double jump power-up highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(powerUpX - 4, powerUpY - 4, powerUp.size / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw player
    drawPlayer();
    
    // Draw score with better styling
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 20, 42);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Coins: ' + coinsCollected, 20, 70);
    ctx.shadowBlur = 0;
    
    // Draw slow down indicator with glow
    if (slowDownActive) {
        const pulse = Math.sin(Date.now() * 0.01) * 5;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15 + pulse;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.fillText('SLOW DOWN!', 20, 97);
        ctx.shadowBlur = 0;
    }
    
    // Draw double jump indicator with glow
    if (doubleJumpActive) {
        const pulse = Math.sin(Date.now() * 0.01) * 5;
        ctx.shadowColor = '#9966ff';
        ctx.shadowBlur = 15 + pulse;
        ctx.fillStyle = '#9966ff';
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.fillText('DOUBLE JUMP!', 20, slowDownActive ? 122 : 97);
        ctx.shadowBlur = 0;
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

