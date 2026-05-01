// ============================================================
// 🌟 Core update: complete pixel-style deep-sea transition plan 🌟
// Includes: 2s hard hold, pixel bubbles, hard-edge pixel sonar, floating pixel text
// ============================================================

let sceneTransition = {
    isActive: false,
    alpha: 0,
    fadeType: 'OUT', 
    targetState: null,
    
    // 1. 🌟 Updated: much lower speed for very slow, elegant fade-out/fade-in
    // Previously 4, now 2. This enhances deep-ocean pressure.
    speed: 2, 
    
    // 2. 🌟 Added: 2-second hard hold control
    holdDuration: 2000, // Pause for 2000 ms (2s) after full black
    holdStartTime: 0,
    
    baseColor: [0, 0, 0],
    
    // 🌟 Added: variables used by complex pixel UI
    pixelParticles: [], // Pixel bubble system
    pixelSonarPulseSize: 0,
    pixelSonarPulseAlpha: 0,
    textOffset: 0 // Vertical text floating offset
};

// 🌟 Added: initialize hard-edge pixel bubbles (rising from bottom)
function initPixelParticles() {
    sceneTransition.pixelParticles = [];
    for (let i = 0; i < 50; i++) { // 50 pixel bubbles
        sceneTransition.pixelParticles.push({
            x: random(width),
            y: random(height + 100, height + 500), // Spawn below screen bottom
            vy: random(-1, -3), // Float upward
            // 🌟 Core: fixed integer pixel sizes only; no smoothing
            size: floor(random(2, 5)) * 2, // Bubble sizes: 4, 6, 8 pixels
            color: [180, 230, 255], // Bright blue
            opacity: 0, 
            sinOffset: random(TWO_PI) // Used for horizontal sway
        });
    }
}

// 🌟 Added: draw hard-edge pixel bubbles (noSmooth + pixel alignment)
function drawPixelParticles(globalAlpha) {
    if (globalAlpha < 50) return; // Skip bubbles when screen is too bright

    push();
    noStroke();
    
    // 🌟 Core: disable p5 smoothing for hard-edge pixel rendering
    noSmooth(); 

    for (let p of sceneTransition.pixelParticles) {
        p.y += p.vy;
        // Bubble opacity follows global alpha
        p.opacity = lerp(p.opacity, (globalAlpha / 255) * 150, 0.05);

        // Reset to bottom when bubble exits top
        if (p.y < -20) {
            p.y = height + random(50, 200);
            p.x = random(width);
        }

        // Horizontal sway for more natural movement
        let driftX = sin(frameCount * 0.02 + p.sinOffset) * 2;
        
        // 🌟 Core: color must include global alpha
        fill(p.color[0], p.color[1], p.color[2], p.opacity);
        
        // 🌟 Core: align bubble coords to integer pixels with floor()
        // Bubbles are pixel blocks/crosses, not circles
        let px = floor(p.x + driftX);
        let py = floor(p.y);
        
        if (p.size === 4) {
            rect(px, py, 4, 4); // 4x4 pixel block
        } else if (p.size === 6) {
            // Build a cross-shaped 6x6 pixel bubble
            rect(px + 2, py, 2, 6);
            rect(px, py + 2, 6, 2);
        } else {
            // Build a rounder-looking 8x8 pixel bubble
            rect(px + 2, py, 4, 8);
            rect(px, py + 2, 8, 4);
        }
    }
    
    // 🌟 Core: restore smoothing to avoid affecting other rendering
    smooth(); 
    pop();
}

// 🌟 Added: draw hard-edge pixel sonar (square outline)
function drawPixelSonar(globalAlpha) {
    if (globalAlpha < 200) return; // Draw only when nearly fully black
    
    sceneTransition.pixelSonarPulseSize += 2; // Expand sonar pulse
    // Sonar alpha fades as pulse grows
    sceneTransition.pixelSonarPulseAlpha = map(sceneTransition.pixelSonarPulseSize, 0, height * 0.4, 255, 0);
    
    if (sceneTransition.pixelSonarPulseSize > height * 0.4) {
        sceneTransition.pixelSonarPulseSize = 0; // Loop
    }

    push();
    noSmooth(); // Disable smoothing
    noFill();
    
    // 🌟 Core: hard-edge stroke in pixel units
    strokeWeight(2); 
    stroke(100, 255, 255, sceneTransition.pixelSonarPulseAlpha); // Bright cyan
    
    // 🌟 Core: coordinates must align to integer pixels
    // Draw a pixel-style square outline as sonar
    let size = floor(sceneTransition.pixelSonarPulseSize);
    rect(floor(width / 2 - size / 2), floor(height / 2 - size / 2), size, size);
    
    smooth(); // Restore smoothing
    pop();
}

// 🌟 Updated: trigger scene transition and initialize pixel data
function triggerTransition(nextState) {
    // Disable transition effects: switch state immediately.
    if (gameManager) {
        gameManager.changeState(nextState);
    }
}

// 🌟 Core update: new transition handler with 2s hard hold and full pixel UI
function drawSceneTransition() {
    // Transition effects disabled intentionally.
    return;
}
let gameManager;
let bgImageLevel1;
let bgImageLevel2;
let bgImageDeepSea; // Added: deep-sea background for Level >= 3 or deep-sea mode
let submarineImg; // Added: submarine sprite replacing boat in deep-sea levels
let sharkImgs = [];  // Added: shark animation frames (4 frames)
let anglerFishImgs = []; // Added: angler fish animation frames (4 frames)
let potionImg;
let laserImg;
let clockImg;
let cloverImg;
let fishboneCollectorImg;
let luckyCoinImg; 
let koiFishImgs = [];
let clubcardImg;
let shopBgImg;
let titleBgm;
let shopBgm; // Fix: declare shopBgm to prevent black-screen errors
let buySfx;
let koiInSfx, koiOutSfx;  // Koi sound effects
let catchSfx;    // Catch-hit sound effect
let ballCatchSfx; // Hook-hit sound effect
let sharkStolenSfx; // Shark-steal item sound effect
let gameplayBgm; // In-game background music
let imgSmallFishes = [];
let imgBigFishes = [];
let imgSkeleton;
let treasureChest;
let boatImg;
let boatImg2;
let hookImg;
let hookImg2;
let nameEntryBgImg;
let modeSelectBgImg;
let levelFailedImg;
let leaderboardBgImg;
let pauseMenuBgImg;
let stones = [];
let newhookImg;
let submarineImg2;
let newhook2Img;
let pearlImg;
let pearlShellImgs = [];
let passcelebrationImg;
let nextlevelImg;
let backImg;
let Treasure_Chest2;
let victoryBgm;
let targetBgm; 

// Added: use Google Fonts pixel font loaded by HTML (no loadFont needed)
// Keep single quotes around Press Start 2P so browser parses correctly
const pixelFont = "'Press Start 2P'";

function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    bgImageLevel2 = loadImage("assets/ocean_bg2.jpg"); 
    passcelebrationImg = loadImage('assets/passcelebration.jpg');
    nextLevelBgImg = loadImage('assets/nextlevel.jpg');
    bgImageDeepSea = loadImage("assets/ocean_bg_deep.jpg"); // Use ocean_bg2.jpg if this image is unavailable
    backImg = loadImage('assets/back.png');
    potionImg = loadImage("assets/PowerPotion.png");
    laserImg = loadImage("assets/Laser.png");
    clockImg = loadImage("assets/SandClock.png");
    cloverImg = loadImage("assets/Clover.png");
    fishboneCollectorImg = loadImage("assets/FishboneCollector.png");
    luckyCoinImg = loadImage("assets/Lucky.png");
    koiFishImgs.push(loadImage("assets/koifish1.png"));
    koiFishImgs.push(loadImage("assets/koifish2.png"));
    koiInSfx = loadSound("assets/KoiIn.mp3");
    koiOutSfx = loadSound("assets/KoiOut.mp3");
    clubcardImg = loadImage("assets/clubcard.png");
    shopBgImg = loadImage("assets/Shop.png");
    titleBgm = loadSound("assets/Ocean.mp3");
    shopBgm = loadSound("assets/ShopGen3.mp3");
    boatImg = loadImage("assets/boat.png");
    boatImg2 = loadImage("assets/boat2.png");
    victoryBgm = loadSound('assets/victory.mp3');
    targetBgm = loadSound('assets/target.mp3');

    
    // 🌟 Important: lowercase maps to opening chest, uppercase maps to closed chest
    treasureChest = loadImage("assets/Treasure_Chest.png");
    Treasure_Chest2 = loadImage("assets/Treasure_Chest2.png");
    
    sharkImg = loadImage('assets/shark_1.png');
    submarineImg = loadImage("assets/submarineImg.png");
    submarineImg2 = loadImage('assets/submarineImg2.png');
    
    for (let i = 1; i <= 4; i++) {
        sharkImgs.push(loadImage(`assets/shark_${i}.png`));
        anglerFishImgs.push(loadImage(`assets/AnglerFish_${i}.png`));
    }
    
    hookImg = loadImage("assets/hook.png");
    hookImg2 = loadImage("assets/hook2.png");
    newhookImg = loadImage("assets/newhook.png");
    newhook2Img = loadImage("assets/newhook2.png");
    buySfx = loadSound("assets/Buy.mp3");
    catchSfx = loadSound("assets/catch_sfx.mp3");
    ballCatchSfx = loadSound("assets/ballcatch.mp3");
    sharkStolenSfx = loadSound("assets/bite.mp3");
    gameplayBgm = loadSound("assets/gameplay_bgm.mp3");

    for (let i = 1; i <= 43; i++) {
        let frame1 = loadImage(`assets/fish${i}_1.png`);
        let frame2 = loadImage(`assets/fish${i}_2.png`);
        imgSmallFishes.push([frame1, frame2]);
    }

    for (let i = 44; i <= 64; i++) {
        let frame1 = loadImage(`assets/fish${i}_1.png`);
        let frame2 = loadImage(`assets/fish${i}_2.png`);
        imgBigFishes.push([frame1, frame2]);
    }

    for (let i = 6; i <= 12; i++) {
        let stone = loadImage(`assets/stone${i}.png`);
        stones.push(stone);
    }
    
    imgSkeleton = loadImage("assets/Skeleton.png");
    pearlImg = loadImage("assets/pearl.png");
    
    for (let i = 1; i <= 4; i++) {
        pearlShellImgs.push(loadImage(`assets/shell_${i}.png`));
    }
    
    nameEntryBgImg = loadImage("assets/deepsea_prospector.png");
    modeSelectBgImg = loadImage("assets/choose_fishing_challenge.png");
    levelFailedImg = loadImage("assets/levelfailed.png");
    leaderboardBgImg = loadImage("assets/leaderboard.png");
    pauseMenuBgImg = loadImage("assets/pause_button_bg.png");
}
function makeWhiteTransparent(img, threshold = 245) {
    if (!img || !img.pixels) return;
    img.loadPixels();
    const p = img.pixels;
    for (let i = 0; i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], b = p[i + 2];
        if (r >= threshold && g >= threshold && b >= threshold) {
            p[i + 3] = 0;
        }
    }
    img.updatePixels();
}

function makeBlackTransparent(img, threshold = 40) {
    if (!img || !img.pixels) return;
    img.loadPixels();
    const p = img.pixels;
    for (let i = 0; i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], b = p[i + 2];
        if (r <= threshold && g <= threshold && b <= threshold) {
            p[i + 3] = 0;
        }
    }
    img.updatePixels();
}

function setup() {
    const canvas = createCanvas(1280, 720);
    canvas.parent("game-container");
    // iPad Magic Keyboard: make canvas focusable so physical keyboard events are received
    canvas.elt.setAttribute("tabindex", "0");

    if (potionImg) makeBlackTransparent(potionImg);
    //if (laserImg) makeBlackTransparent(laserImg);
    if (clockImg) makeBlackTransparent(clockImg);
    //if (submarineImg) makeBlackTransparent(submarineImg);
    if (pauseMenuBgImg) makeWhiteTransparent(pauseMenuBgImg);

    gameManager = new GameManager();
    gameManager._applyVolume();
    gameManager._applySfxVolume();
    gameManager.changeState(GameState.NAME_ENTRY);
    wireModeButtons();

    // ==========================================
    // 🌟 Place this below wireModeButtons(), before setup() closing brace
    // ==========================================
    document.addEventListener('fullscreenchange', () => {
        // Slight 100ms delay to wait for browser fullscreen animation
        setTimeout(() => {
            let c = document.querySelector('canvas');
            if (c) {
                c.focus(); // Force keyboard focus back to the game canvas
            }
        }, 100);
    });
} 
function wireModeButtons() {
    const overlay = document.getElementById("button-overlay");
    const mermaidCursor = document.getElementById("mermaid-cursor");
    const diffGroup = document.getElementById("difficulty-buttons");
    const playerGroup = document.getElementById("player-mode-buttons");

    let hoveredButton = null;
    const allModeButtons = [
        document.getElementById("btn-easy"),
        document.getElementById("btn-hard"),
        document.getElementById("btn-single"),
        document.getElementById("btn-two"),
    ];
    allModeButtons.forEach((btn) => {
        if (!btn) return;
        btn.addEventListener("mouseenter", () => {
            hoveredButton = btn;
        });
        btn.addEventListener("mouseleave", () => {
            hoveredButton = null;
        });
    });

    document.getElementById("btn-easy").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentDifficulty = Difficulty.EASY;
        gameManager.changeState(GameState.PLAYER_MODE_SELECT);
    });
    document.getElementById("btn-hard").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentDifficulty = Difficulty.HARD;
        gameManager.changeState(GameState.PLAYER_MODE_SELECT);
    });

    document.getElementById("btn-single").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentPlayerMode = PlayerMode.SINGLE;
        gameManager.startGame(); // Fix: removed Easy-only restriction; single-player works on any difficulty
    });

    document.getElementById("btn-two").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentPlayerMode = PlayerMode.TWO_PLAYER;
        gameManager.startGame();
    });

    function syncOverlay() {
        const s = gameManager.currentState;
        if (s === GameState.DIFFICULTY_SELECT) {
            overlay.classList.remove("hidden");
            overlay.classList.add("active");
            diffGroup.classList.remove("hidden");
            playerGroup.classList.add("hidden");
        } else if (s === GameState.PLAYER_MODE_SELECT) {
            overlay.classList.remove("hidden");
            overlay.classList.add("active");
            diffGroup.classList.add("hidden");
            playerGroup.classList.remove("hidden");
        } else {
            overlay.classList.add("hidden");
            overlay.classList.remove("active");
        }
    }

    function syncSelectionHighlight() {
        const s = gameManager.currentState;
        const idx = gameManager.menuSelectionIndex;
        const diffBtns = [
            document.getElementById("btn-easy"),
            document.getElementById("btn-hard"),
        ];
        const playerBtns = [
            document.getElementById("btn-single"),
            document.getElementById("btn-two"),
        ];

        // Fix: first clear all row-selected classes to prevent ghost highlights
        document
            .querySelectorAll(".btn-row")
            .forEach((r) => r.classList.remove("row-selected"));
        document
            .querySelectorAll(".pixel-btn")
            .forEach((b) => b.classList.remove("menu-selected"));

        // Then add highlight only to the actual selected option
        diffBtns.forEach((b, i) => {
            const selected = s === GameState.DIFFICULTY_SELECT && i === idx;
            if (selected) {
                b?.classList.add("menu-selected");
                b?.closest(".btn-row")?.classList.add("row-selected");
            }
        });
        playerBtns.forEach((b, i) => {
            const selected = s === GameState.PLAYER_MODE_SELECT && i === idx;
            if (selected) {
                b?.classList.add("menu-selected");
                b?.closest(".btn-row")?.classList.add("row-selected");
            }
        });

        // Single mermaid cursor: mouse hover has priority; otherwise follow keyboard selection
        const MARGIN = 12;
        const ICON_SIZE = 48;
        let activeBtn = null;
        if (s === GameState.DIFFICULTY_SELECT) {
            activeBtn =
                hoveredButton && diffBtns.includes(hoveredButton)
                    ? hoveredButton
                    : (diffBtns[idx] ?? null);
        } else if (s === GameState.PLAYER_MODE_SELECT) {
            activeBtn =
                hoveredButton && playerBtns.includes(hoveredButton)
                    ? hoveredButton
                    : (playerBtns[idx] ?? null);
        }
        if (mermaidCursor && activeBtn) {
            const or = overlay.getBoundingClientRect();
            const br = activeBtn.getBoundingClientRect();
            mermaidCursor.style.left = `${br.left - or.left - ICON_SIZE - MARGIN}px`;
            mermaidCursor.style.top = `${br.top - or.top + (br.height - ICON_SIZE) / 2}px`;
            mermaidCursor.classList.add("visible");
        } else if (mermaidCursor) {
            mermaidCursor.classList.remove("visible");
        }
    }

    gameManager._syncOverlay = syncOverlay;
    gameManager._syncSelectionHighlight = syncSelectionHighlight;
}

let lastGameState = null;

function draw() {
    // 1. Keep original update and render logic unchanged
    if (gameManager) {
        gameManager.update();
    }

    if (gameManager && gameManager._syncOverlay && gameManager.currentState !== lastGameState) {
        gameManager._syncOverlay();
        lastGameState = gameManager.currentState;
    }
    if (gameManager && gameManager._syncSelectionHighlight) {
        gameManager._syncSelectionHighlight();
    }

    // 2. 🌟 Added: draw transition overlay after everything else so it covers all content
    drawSceneTransition(); 
}

function mousePressed() {
    // Refocus canvas on tap (helps iPad Magic Keyboard when focus is lost)
    if (gameManager) {
        const keyboardStates = [GameState.NAME_ENTRY, GameState.DIFFICULTY_SELECT, GameState.PLAYER_MODE_SELECT, GameState.PLAYING];
        if (keyboardStates.includes(gameManager.currentState)) {
            const c = document.querySelector("#game-container canvas");
            if (c) c.focus();
        }
        // Ensure click coordinates are passed correctly (e.g., input focus click)
        gameManager.scaledMouseX = typeof mouseX !== "undefined" ? mouseX : 0;
        gameManager.scaledMouseY = typeof mouseY !== "undefined" ? mouseY : 0;
    }
    userStartAudio();
    if (gameManager) gameManager.handleMousePress();
}

function keyPressed() {
    // 1. Globally intercept Space (prevent accidental triggers + force fullscreen)
    if (keyCode === 32) {
        if (!fullscreen()) {
            fullscreen(true);
        }
        return false; 
    }

    // 2. Forward key input to game (GameManager handles Backspace deletion there)
    if (typeof gameManager !== 'undefined' && gameManager) {
        gameManager.handleKeyPress(key, keyCode);
    }

    // 🌟 3. Ultimate guard: always block browser Back navigation on Backspace
    if (keyCode === 8 || key === 'Backspace') {
        return false; 
    }
    
    // 4. Block arrow keys to prevent page scrolling while playing
    if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
        return false;
    }
}

function mouseWheel(event) {
    if (gameManager) gameManager.handleMouseWheel(event);
    return false;
}

function mouseDragged() {
    if (gameManager) gameManager.handleMouseDragged();
}

function mouseReleased() {
    if (gameManager) gameManager.handleMouseReleased();
}
