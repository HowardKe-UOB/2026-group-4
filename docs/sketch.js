let gameManager;
let bgImageLevel1;
let potionImg;
let titleBgm;
let imgSmallFishes = [];
let imgSkeletons = [];
let treasureChest;
function preload() {
    bgImageLevel1 = loadImage("assets/ocean_bg.jpg");
    potionImg = loadImage("assets/PowerPotion.png");
    laserImg = loadImage("assets/Laser.png");
    titleBgm = loadSound("assets/Ocean.mp3");
    shopBgm = loadSound("assets/ShopGen3.mp3");
    let colors = ["blue", "cyan", "green", "purple", "red", "yellow"];
    for (let c of colors) {
        for (let i = 1; i <= 3; i++) {
            imgSmallFishes.push(loadImage(`assets/fish_${c}${i}.png`));
        }
    }
    let skeletonColors = ["blue", "green", "orange"];
    for (let c of skeletonColors) {
        imgSkeletons.push(loadImage(`assets/fish_${c}_skeleton.png`));
    }
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
