let gameManager;
let bgImageLevel1;
let potionImg;
let titleBgm;

function preload() {
    bgImageLevel1 = loadImage('js/ocean_bg.jpg');
    potionImg = loadImage('assets/PowerPotion.png');
    titleBgm = loadSound('assets/Ocean.mp3');
}

function setup() {
    createCanvas(800, 600);
    gameManager = new GameManager();
}

function draw() {
    // 你的 GameManager 将 update 和 draw 写在了一起，这样调用非常完美
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