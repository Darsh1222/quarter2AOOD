const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game states
const STATE_MENU = 'menu';
const STATE_LEVEL_SELECT = 'levelSelect';

let gameState = STATE_MENU;

// Themes
const themes = {
    default: {
        bg: '#0f0f1e'
    },
    tax: {
        bg: '#1a1a1a'
    },
    geo: {
        bg: '#0a0a2e'
    }
};

let currentTheme = themes.default;

// Levels
const levels = [
    { name: 'Stereo Maxness', theme: 'default' }
];

let selectedLevel = 0;

// Initialize game
function init() {
    // Event listeners
    canvas.addEventListener('click', handleClick);
    
    // Start game loop
    gameLoop();
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
            // Level selected - game would start here
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

// Draw function
function draw() {
    if (gameState === STATE_MENU) {
        drawMenu();
    } else if (gameState === STATE_LEVEL_SELECT) {
        drawLevelSelect();
    }
}

// Game loop
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
init();

