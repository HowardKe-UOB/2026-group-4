class GameObject {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.sprite = null; // 留作后续加载图片用
    }

    draw() {
        // 默认绘制一个占位符，子类会重写这个方法
        fill(255);
        circle(this.position.x, this.position.y, 20);
    }
}
