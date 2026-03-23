// ============================================================
// 🌟 核心修改：真正的像素风格深海过场动画全案 🌟
// 包含：2秒硬停顿、像素气泡、像素硬边声纳、像素浮动文字
// ============================================================

let sceneTransition = {
    isActive: false,
    alpha: 0,
    fadeType: 'OUT', 
    targetState: null,
    
    // 1. 🌟 修改：速度降得极低，让淡出/淡入过程极其缓慢优雅
    // 以前是4，现在改成 2。让 Stakeholder 感受大洋的压迫感。
    speed: 2, 
    
    // 2. 🌟 新增：2秒硬停顿控制
    holdDuration: 2000, // 完全黑透后暂停 2000 毫秒 (2秒)
    holdStartTime: 0,
    
    baseColor: [30, 90, 140],
    
    // 🌟 新增：用于复杂像素 UI 的变量
    pixelParticles: [], // 像素气泡系统
    pixelSonarPulseSize: 0,
    pixelSonarPulseAlpha: 0,
    textOffset: 0 // 文字上下浮动
};

// 🌟 新增：初始化硬边像素气泡（从底部冒泡）
function initPixelParticles() {
    sceneTransition.pixelParticles = [];
    for (let i = 0; i < 50; i++) { // 50个像素气泡
        sceneTransition.pixelParticles.push({
            x: random(width),
            y: random(height + 100, height + 500), // 在屏幕底部下方生成
            vy: random(-1, -3), // 向上漂浮
            // 🌟 核心：气泡必须是固定的像素大小，没有小数，不平滑
            size: floor(random(2, 5)) * 2, // 生成 4, 6, 8 像素大小的气泡
            color: [180, 230, 255], // 亮蓝色
            opacity: 0, 
            sinOffset: random(TWO_PI) // 用于左右摆动
        });
    }
}

// 🌟 新增：绘制硬边像素气泡（核心技术：noSmooth, 像素对齐）
function drawPixelParticles(globalAlpha) {
    if (globalAlpha < 50) return; // 屏幕太亮时不画气泡

    push();
    noStroke();
    
    // 🌟 核心：关闭 p5 的平滑缩放，强制所有绘制都是硬边像素
    noSmooth(); 

    for (let p of sceneTransition.pixelParticles) {
        p.y += p.vy;
        // 气泡随Alpha淡入出
        p.opacity = lerp(p.opacity, (globalAlpha / 255) * 150, 0.05);

        // 如果飘出顶部，重新回到最底部
        if (p.y < -20) {
            p.y = height + random(50, 200);
            p.x = random(width);
        }

        // 气泡左右摆动，更有灵动感
        let driftX = sin(frameCount * 0.02 + p.sinOffset) * 2;
        
        // 🌟 核心：颜色必须包含全局Alpha
        fill(p.color[0], p.color[1], p.color[2], p.opacity);
        
        // 🌟 核心：绘制像素气泡。必须用 floor 将坐标对齐到整数像素上！
        // 气泡不是圆的，是像素块组成的方块/十字
        let px = floor(p.x + driftX);
        let py = floor(p.y);
        
        if (p.size === 4) {
            rect(px, py, 4, 4); // 4x4 像素块
        } else if (p.size === 6) {
            // 组成一个十字形的 6x6 像素气泡
            rect(px + 2, py, 2, 6);
            rect(px, py + 2, 6, 2);
        } else {
            // 组成一个更像圆的 8x8 像素气泡
            rect(px + 2, py, 4, 8);
            rect(px, py + 2, 8, 4);
        }
    }
    
    // 🌟 核心：恢复平滑绘制，以免影响游戏其他部分
    smooth(); 
    pop();
}

// 🌟 新增：绘制硬边像素声纳（正方形描边）
function drawPixelSonar(globalAlpha) {
    if (globalAlpha < 200) return; // 屏幕黑透了才画
    
    sceneTransition.pixelSonarPulseSize += 2; // 声纳扩大
    // 声纳Alpha随着变大而淡出
    sceneTransition.pixelSonarPulseAlpha = map(sceneTransition.pixelSonarPulseSize, 0, height * 0.4, 255, 0);
    
    if (sceneTransition.pixelSonarPulseSize > height * 0.4) {
        sceneTransition.pixelSonarPulseSize = 0; // 循环
    }

    push();
    noSmooth(); // 关闭平滑
    noFill();
    
    // 🌟 核心：硬边描边。描边厚度也是像素单位。
    strokeWeight(2); 
    stroke(100, 255, 255, sceneTransition.pixelSonarPulseAlpha); // 亮蓝绿色
    
    // 🌟 核心：坐标必须对齐整数像素。
    // 画一个像素风格的正方形描边作为声纳
    let size = floor(sceneTransition.pixelSonarPulseSize);
    rect(floor(width / 2 - size / 2), floor(height / 2 - size / 2), size, size);
    
    smooth(); // 恢复平滑
    pop();
}

// 🌟 修改：触发场景切换，初始化像素数据
function triggerTransition(nextState) {
    if (sceneTransition.isActive) return; 
    sceneTransition.isActive = true;
    sceneTransition.fadeType = 'OUT'; // 开始变黑
    sceneTransition.alpha = 0;
    sceneTransition.targetState = nextState; 
    sceneTransition.holdStartTime = 0;
    
    // 初始化像素系统
    initPixelParticles(); 
}

// 🌟 核心修改：全新的处理函数，包含2秒硬暂停逻辑和所有像素 UI
function drawSceneTransition() {
    if (!sceneTransition.isActive) return;

    // --- 第一层：深海背景遮罩 ---
    // 缓慢变黑，大洋压迫感
    push();
    noStroke();
    let vignetteColor = sceneTransition.baseColor;
    fill(vignetteColor[0], vignetteColor[1], vignetteColor[2], sceneTransition.alpha);
    rect(0, 0, width, height); // 简单的全屏矩形，配合超慢速， Stakeholder 会满意的
    pop();

    // --- 第二层：像素冒泡系统 ---
    drawPixelParticles(sceneTransition.alpha);

    // --- 第三层：中央像素 UI（声纳与文字） ---
    // 只有在变黑或在停顿状态下才画
    if (sceneTransition.alpha > 200) {
        // 1. 绘制硬边像素声纳
        drawPixelSonar(sceneTransition.alpha);

        // 2. 绘制像素呼吸浮动文字
        push();
        textAlign(CENTER, CENTER);
        if (typeof pixelFont !== "undefined" && pixelFont) {
            textFont(pixelFont);
        }
        textSize(24);

        // 文字颜色脉冲（蓝绿之间）
        let tPulse = sin(frameCount * 0.05);
        let tColor = lerpColor(color(150, 255, 200), color(220, 255, 255), (tPulse + 1) / 2);
        
        // 🌟 核心：文字上下浮动效果
        sceneTransition.textOffset = sin(frameCount * 0.03) * 6; // 上下浮动 6 像素

        // 🌟 核心：颜色必须包含当前的全局Alpha，且坐标 floor 对齐像素
        fill(red(tColor), green(tColor), blue(tColor), sceneTransition.alpha);
        text("DIVING DEEPER...", floor(width / 2), floor(height / 2 + sceneTransition.textOffset));
        pop();
    }

    // --- 核心逻辑控制：淡出 -> 停顿 2秒 -> 淡入 ---
    if (sceneTransition.fadeType === 'OUT') {
        sceneTransition.alpha += sceneTransition.speed;
        if (sceneTransition.alpha >= 255) {
            sceneTransition.alpha = 255;
            // 🌟 核心修改：淡出结束，进入停顿（HOLD）状态，并记下时间！
            sceneTransition.fadeType = 'HOLD'; 
            sceneTransition.holdStartTime = millis(); 
            
            // 🌟 核心：等屏幕完全黑透了，再切换游戏状态！
            if (gameManager) {
                gameManager.changeState(sceneTransition.targetState);
            }
        }
    } else if (sceneTransition.fadeType === 'HOLD') {
        // 🌟 新增逻辑：检查是否停顿够了两秒
        let timePassed = millis() - sceneTransition.holdStartTime;
        if (timePassed >= sceneTransition.holdDuration) {
            // 停顿够了，开始淡入亮起来
            sceneTransition.fadeType = 'IN'; 
        }
    } else if (sceneTransition.fadeType === 'IN') {
        sceneTransition.alpha -= sceneTransition.speed;
        if (sceneTransition.alpha <= 0) {
            sceneTransition.isActive = false; // 动画彻底结束
        }
    }
}
let gameManager;
let bgImageLevel1;
let bgImageLevel2;
let bgImageDeepSea; // 【新增】深海背景 - 用于Level >= 3或触发深海模式
let submarineImg; // 【新增】潜水艇图片 - 深海关卡替换小船
let sharkImgs = [];  // 【新增】鲨鱼动画帧 - 深海掠食者（4帧）
let anglerFishImgs = []; // 【新增】鮟鱇鱼动画帧 - 深海发光生物（4帧）
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
let shopBgm; // 【修复】补充声明 shopBgm，防止黑屏报错
let buySfx;
let koiInSfx, koiOutSfx;  // 锦鲤音效
let catchSfx;    // 抓鱼抓中音效
let ballCatchSfx; // 钩子碰到鱼的音效
let sharkStolenSfx; // 鲨鱼偷走物品的音效
let gameplayBgm; // 游戏中背景音乐
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
// 【新增】使用 HTML 已加载的 Google Fonts 像素字体，无需 loadFont
// Press Start 2P加单引号，让浏览器解析
const pixelFont = "'Press Start 2P'";

function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    bgImageLevel2 = loadImage("assets/ocean_bg2.jpg"); // 确保文件名和后缀绝对一致！

    bgImageDeepSea = loadImage("assets/ocean_bg_deep.jpg"); // 【修复】此文件不存在，使用 ocean_bg2 代替 // 需要新增此资源或使用现有的ocean_bg2作为深海
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
    // 潜水艇图片（文件不存在时自动使用代码绘制的 fallback）
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
    treasureChest = loadImage("assets/Treasure_Chest.png");
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
    gameManager.changeState(GameState.NAME_ENTRY);
    wireModeButtons();
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
        gameManager.startGame(); // 【修复】去掉了 Easy 限制，现在任何难度点单人都能玩了！
    });

    document.getElementById("btn-two").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentPlayerMode = PlayerMode.TWO_PLAYER;
        gameManager.startGame();
    });

    document.getElementById("back-btn").addEventListener("click", () => {
        userStartAudio();
        if (gameManager.currentState === GameState.DIFFICULTY_SELECT) {
            gameManager.changeState(GameState.NAME_ENTRY);
        } else if (gameManager.currentState === GameState.PLAYER_MODE_SELECT) {
            gameManager.changeState(GameState.DIFFICULTY_SELECT);
        }
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

        // 【修复】首先清除所有的 row-selected 类，防止重影
        document
            .querySelectorAll(".btn-row")
            .forEach((r) => r.classList.remove("row-selected"));
        document
            .querySelectorAll(".pixel-btn")
            .forEach((b) => b.classList.remove("menu-selected"));

        // 然后只添加到正确选中的选项
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

        // 单一美人鱼：鼠标优先，悬停时跟随鼠标，否则跟随键盘选择
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
    // 1. 原本更新和画游戏的逻辑不变
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

    // 2. 🌟 【新增】在所有东西都画完之后，画过场动画！这样它才能挡住所有东西
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
        // 确保点击坐标正确传递（支持点击输入框聚焦等）
        gameManager.scaledMouseX = typeof mouseX !== "undefined" ? mouseX : 0;
        gameManager.scaledMouseY = typeof mouseY !== "undefined" ? mouseY : 0;
    }
    userStartAudio();
    if (gameManager) gameManager.handleMousePress();
}

function keyPressed() {
    userStartAudio();
    if (gameManager) gameManager.handleKeyPress(key, keyCode);
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
