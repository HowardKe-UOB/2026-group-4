let gameManager;
let bgImageLevel1; // 声明全局变量，供 LevelManager 使用

function preload() {
    // 加上 js/ 路径，告诉它去 js 文件夹里找图片
    bgImageLevel1 = loadImage('js/ocean_bg.jpg'); 
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
    if (gameManager) gameManager.handleMousePress();
}

function keyPressed() {
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