let gameManager;

function setup() {
    createCanvas(800, 600);
    gameManager = new GameManager();
}

function draw() {
    gameManager.update();
}

function mousePressed() {
    gameManager.handleMousePress();
}

function keyPressed() {
    gameManager.handleKeyPress(key, keyCode);
}
