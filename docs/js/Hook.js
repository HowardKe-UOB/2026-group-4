class Hook extends GameObject {
    constructor(x, y, customSprite) {
        super(x, y);
        this.origin = createVector(x, y);
        this.state = HookState.IDLE_SWINGING;
        this.moveSpeed = 5;
        this.attachedItem = null;

        this.retractMultiplier = 1;
        this.hasLaser = false;

        this.angle = 0;
        this.angleVel = 0.028;
        this.swingSpeedMultiplier = 1;  // Initial swing speed multiplier is 1
        this.length = 50;
        this.maxLength = 900;

        // New feature: use custom sprite if provided, otherwise fallback to default
        this.sprite = customSprite || (typeof hookImg !== "undefined" ? hookImg : null);
    }

    update() {
        if (this.state === HookState.IDLE_SWINGING) {
            this.angle = (sin(frameCount * this.angleVel * this.swingSpeedMultiplier) * PI) / 3;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;
        } else if (this.state === HookState.MOVING_DOWN) {
            this.length += this.moveSpeed;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            if (
                this.position.y > height ||
                this.position.x < 0 ||
                this.position.x > width
            ) {
                this.retractUp();
            }
        } else if (this.state === HookState.MOVING_UP) {
            let originalSpeed = this.attachedItem
                ? max(1, this.moveSpeed - this.attachedItem.weight)
                : this.moveSpeed;
            let currentSpeed = originalSpeed * (this.retractMultiplier || 1);
            this.length -= currentSpeed;

            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            if (this.attachedItem) {
                let tipOffset = 28;
                this.attachedItem.position.x =
                    this.position.x + sin(this.angle) * tipOffset;
                this.attachedItem.position.y =
                    this.position.y + cos(this.angle) * tipOffset;
            }

            if (this.length <= 50) {
                this.state = HookState.IDLE_SWINGING;
                return this.attachedItem;
            }
        }
        return null;
    }

    deployDown() {
        if (this.state === HookState.IDLE_SWINGING) {
            this.state = HookState.MOVING_DOWN;
        }
    }

    retractUp() {
        this.state = HookState.MOVING_UP;
    }

    grabItem(item) {
        this.attachedItem = item;
        this.retractUp();
    }

    draw() {
        if (this.hasLaser && this.state === HookState.IDLE_SWINGING) {
            push();
            stroke(0, 255, 0, 125);
            strokeWeight(3);
            let laserEndX = this.origin.x + sin(this.angle) * this.maxLength;
            let laserEndY = this.origin.y + cos(this.angle) * this.maxLength;
            line(this.origin.x, this.origin.y, laserEndX, laserEndY);
            pop();
        }

        let isNewHook = (typeof newhookImg !== "undefined" && this.sprite === newhookImg);
        let isNewHook2 = (typeof newhook2Img !== "undefined" && this.sprite === newhook2Img);
        let isOldHook2 = (typeof hookImg2 !== "undefined" && this.sprite === hookImg2);
        let isAnyMechHook = isNewHook || isNewHook2;

        // Rope color: silver-gray for mech hooks, brown for old harpoons
        if (isAnyMechHook) {
            stroke(150, 160, 170); 
        } else {
            stroke(85, 55, 35); 
        }
        strokeWeight(3);

        // Hide rope for deep-sea mech hooks while idle (embedded look)
        if (!(isAnyMechHook && this.state === HookState.IDLE_SWINGING)) {
            line(this.origin.x, this.origin.y, this.position.x, this.position.y);
        }

        push();
        translate(this.position.x, this.position.y);
        let lineAngle = atan2(this.position.y - this.origin.y, this.position.x - this.origin.x);
        imageMode(CENTER);

       
        if (isNewHook2) {
            // Right player (P2): -90 gives perfect vertical alignment
            rotate(lineAngle + radians(-90)); 
            image(this.sprite, 0, 0, 110, 110); 
            
        } else if (isNewHook) {
            // Left player (P1): use 270 to flip by 180 degrees
            rotate(lineAngle + radians(270));  
            image(this.sprite, 0, 0, 110, 110);
            
        } else if (isOldHook2) {
            // Left player (P1) shallow-water old harpoon
            rotate(lineAngle + radians(135));
            image(this.sprite, 0, 0, 80, 80);
        } else {
            // Right player (P2) shallow-water old harpoon
            rotate(lineAngle + radians(135));
            if (this.sprite) {
                image(this.sprite, 0, 0, 80, 80);
            }
        }
        pop();

        if (this.attachedItem) {
            this.attachedItem.draw();
        }
    }
}