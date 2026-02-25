// 全局变量，用来存储图片和音乐对象
let potionImg;
let titleBgm;
let gameManager;

function preload() {
    // 提前加载资源，确保游戏开始前准备完毕
    // 请确保文件路径与你实际存放的路径一致
    potionImg = loadImage('assets/PowerPotion.png'); 
    titleBgm = loadSound('assets/Ocean.mp3');
}

function setup() {
    createCanvas(800, 600);
    gameManager = new GameManager();
}

function draw() {
    gameManager.update();
}

function mousePressed() {
    // 强制激活音频（仅需第一次有效，之后会自动开启）
    userStartAudio();
    gameManager.handleMousePress();
}

function keyPressed() {
    // 强制激活音频（仅需第一次有效，之后会自动开启）
    userStartAudio();
    gameManager.handleKeyPress(key, keyCode);
}
