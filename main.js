function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Grid {
  constructor(stage, x, y, cellPX, borderPX) {
    this.xCount = x;
    this.yCount = y;
    this.cellPX = cellPX;
    this.borderPX = borderPX;
    this.startX = 2;
    this.startY = 2;

    this.stage = stage;
    this.shape = new createjs.Shape();
    this.stage.addChild(this.shape);
  }

  render() {
    var g = this.shape.graphics;
    // 填充颜色
    g.beginFill('#DDDDDD').drawRect(this.startX, this.startY, this.xCount * this.cellPX, this.yCount * this.cellPX);
    // 划分割线
    g.beginStroke("#000000");
    g.setStrokeStyle(this.borderPX);
    // 横线
    for (let i = 0; i <= this.yCount; i++) {
      g.moveTo(this.startX, this.startY + this.cellPX * i);
      g.lineTo(this.startX + this.xCount * this.cellPX, this.startY + this.cellPX * i);
    }
    // 竖线
    for (let i = 0; i <= this.xCount; i++) {
      g.moveTo(this.startX + this.cellPX * i, this.startY);
      g.lineTo(this.startX + this.cellPX * i, this.startY + this.yCount * this.cellPX);
    }
    g.endStroke();
  }
}

async function init() {
  var stage = new createjs.Stage("demoCanvas");
  createjs.Touch.enable(stage);

  var grid = new Grid(stage, 14, 14, 60, 2);
  grid.render();
  // {
  //   var circle = new createjs.Shape();
  //   circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
  //   circle.x = 100;
  //   circle.y = 100;
  //   stage.addChild(circle);
  // }
  stage.update();
}