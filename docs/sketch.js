let gameManager;
let bgImageLevel1;
let bgImageLevel2;
let potionImg;
let laserImg;
let clockImg;
let shopBgImg;
let titleBgm;
let shopBgm; // 【修复】补充声明 shopBgm，防止黑屏报错
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
let stones = [];

function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    bgImageLevel2 = loadImage("assets/ocean_bg2.jpg"); // 确保文件名和后缀绝对一致！
    potionImg = loadImage("assets/PowerPotion.png");
    laserImg = loadImage("assets/Laser.png");
    clockImg = loadImage("assets/SandClock.png");
    shopBgImg = loadImage("assets/Shop.png");
    titleBgm = loadSound("assets/Ocean.mp3");
    shopBgm = loadSound("assets/ShopGen3.mp3");
    boatImg = loadImage("assets/boat.png");
    boatImg2 = loadImage("assets/boat2.png");
    hookImg = loadImage("assets/hook.png");
    hookImg2 = loadImage("assets/hook2.png");

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
    nameEntryBgImg = loadImage("assets/deepsea_prospector.png");
    modeSelectBgImg = loadImage("assets/choose_fishing_challenge.png");
    levelFailedImg = loadImage("assets/levelfailed.png");
}

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent("game-container");
    gameManager = new GameManager();
    wireModeButtons();
}

function wireModeButtons() {
    const overlay = document.getElementById("button-overlay");
    const diffGroup = document.getElementById("difficulty-buttons");
    const playerGroup = document.getElementById("player-mode-buttons");

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

    gameManager._syncOverlay = syncOverlay;
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
}

function mousePressed() {
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
