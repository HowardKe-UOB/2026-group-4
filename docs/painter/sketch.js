let isSprayMode = false;
let isEraserMode = false;
function setup() {
    createCanvas(1000, 800);
    background(255);
    let btn = createButton("Toggle Brush");
    let btn2 = createButton("Eraser");
    btn.position(20, 20); // The position of the button
    btn2.position(20, 140);
    btn.size(200, 100);
    btn2.size(200, 100);
    btn.mousePressed(changeSprayMode); // Setting: When clicked, run the changeMode function
    btn2.mousePressed(changeEraserMode);
}
function changeSprayMode() {
    isSprayMode = !isSprayMode;
    isEraserMode = false;
}
function changeEraserMode() {
    isEraserMode = !isEraserMode;
    isSprayMode = false;
}

function draw() {
    //pattern 1 line mode
    if (mouseIsPressed) {
        if (isSprayMode == true) {
            noStroke(); // Spraying paint does not require a border.
            fill(random(100, 255), random(100, 255), random(100, 255)); // Spray colour

            for (let n = 0; n < 5; n++) {
                let angle = random(TWO_PI);
                let r = random(15);
                ellipse(
                    mouseX + r * cos(angle),
                    mouseY + r * sin(angle),
                    random(4),
                    random(4),
                );
            }
            //pattern 2 eraser mode
        } else if (isEraserMode == true) {
            noStroke();
            fill(255);
            circle(mouseX, mouseY, 30);
        }
        //pattern 3 spray mode
        else {
            stroke(random(150, 255), random(100, 255), random(100, 255));
            strokeWeight(5);
            line(pmouseX, pmouseY, mouseX, mouseY);
        }
    }
}
