let gameManager;
let bgImageLevel1;
let potionImg;
let laserImg;
let clockImg;
let shopBgImg;
let titleBgm;
let imgSmallFishes = [];
let imgBigFishes = [];
let imgSkeleton;
let treasureChest;
let boatImg;
let hookImg;
let nameEntryBgImg;
let modeSelectBgImg;
function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    potionImg = loadImage("assets/PowerPotion.png");
    laserImg = loadImage("assets/Laser.png");
    clockImg = loadImage("assets/SandClock.png");
    shopBgImg = loadImage("assets/Shop.png");
    titleBgm = loadSound("assets/Ocean.mp3");
    shopBgm = loadSound("assets/ShopGen3.mp3");
    boatImg = loadImage("assets/boat.png");
    hookImg = loadImage("assets/hook.png");
    

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
    imgSkeleton = loadImage("assets/Skeleton.png");
    treasureChest = loadImage("assets/Treasure_Chest.png");
    nameEntryBgImg = loadImage("assets/deepsea_prospector.png");
    modeSelectBgImg = loadImage("assets/choose_fishing_challenge.png");
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
    const singleUnavail = document.getElementById("single-unavailable");

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
        if (gameManager.currentDifficulty === Difficulty.EASY) gameManager.startGame();
    });
    document.getElementById("btn-two").addEventListener("click", () => {
        userStartAudio();
        gameManager.currentPlayerMode = PlayerMode.TWO_PLAYER;
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
            singleUnavail.style.display =
                gameManager.currentDifficulty === Difficulty.HARD ? "" : "none";
        } else {
            overlay.classList.add("hidden");
            overlay.classList.remove("active");
        }
    }

    gameManager._syncOverlay = syncOverlay;
}

function draw() {
    gameManager.update();
    if (gameManager._syncOverlay) gameManager._syncOverlay();
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
