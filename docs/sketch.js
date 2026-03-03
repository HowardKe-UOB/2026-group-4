let gameManager;
let bgImageLevel1;
let potionImg;
let titleBgm;
let imgSmallFishes = [];
let imgBigFishes = [];
let imgSkeleton;
let treasureChest;
let boatImg;
let hookImg;
function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    potionImg = loadImage("assets/PowerPotion.png");
    laserImg = loadImage("assets/Laser.png");
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
    treasureChest = loadImage("assets/Treasure_Chest .png");
}

function setup() {
    createCanvas(800, 600);
    gameManager = new GameManager();
}

function draw() {
    gameManager.update();
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
