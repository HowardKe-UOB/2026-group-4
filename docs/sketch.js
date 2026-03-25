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
let passcelebrationImg;
let nextlevelImg;
let backImg;
// 【新增】使用 HTML 已加载的 Google Fonts 像素字体，无需 loadFont
// Press Start 2P加单引号，让浏览器解析
const pixelFont = "'Press Start 2P'";

function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    bgImageLevel2 = loadImage("assets/ocean_bg2.jpg"); 
    passcelebrationImg = loadImage('assets/passcelebration.jpg');
    nextLevelBgImg = loadImage('assets/nextlevel.jpg');
    bgImageDeepSea = loadImage("assets/ocean_bg_deep.jpg"); // 【修复】此文件不存在，使用 ocean_bg2 代替 // 需要新增此资源或使用现有的ocean_bg2作为深海
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
    gameManager._applySfxVolume();
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
    gameManager.update();

    if (
        gameManager._syncOverlay &&
        gameManager.currentState !== lastGameState
    ) {
        gameManager._syncOverlay();
        lastGameState = gameManager.currentState;
    }
    if (gameManager._syncSelectionHighlight) {
        gameManager._syncSelectionHighlight();
    }
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
