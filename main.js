function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Square {
  constructor(stage, xCount, yCount, cellPX, borderPX) {
    this.xCount = xCount;
    this.yCount = yCount;
    this.cellPX = cellPX;
    this.borderPX = borderPX;
    this.startX = 2;
    this.startY = 2;

    this.stage = stage;
    this._initCells(xCount, yCount);

    // 网格要浮在最上面，因此最后才 add
    this.gridShape = new createjs.Shape();
    this.stage.addChild(this.gridShape);
  }

  _initCells(xCount, yCount) {
    this.cells = [];
    for (let i = 0; i < yCount; i++) {
      var cellRow = [];
      for (let j = 0; j < xCount; j++) {
        cellRow.push(new Cell(this.stage, this, j, i))
      }
      this.cells.push(cellRow);
    }
  }

  render() {
    // Render Cell
    for (let i = 0; i < this.cells.length; i++) {
      var cellRow = this.cells[i];
      for (let j = 0; j < cellRow.length; j++) {
        cellRow[j].render();
      }
    }
    // Render Self: 划分割线
    this._renderGrid(this.gridShape.graphics);
  }

  _renderGrid(g) {
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

var CellType = {
  Block: 1,
  NoBlock: 2
};
class Cell {
  constructor(stage, square, indexX, indexY) {
    this.stage = stage;
    this.square = square;
    this.indexX = indexX;
    this.indexY = indexY;
    this.type = CellType.NoBlock;

    this.shape = new createjs.Shape();
    this.stage.addChild(this.shape);

    this.shape.addEventListener('click', (event) => {
      alert(`x: ${this.indexX}, y: ${this.indexY}`);
    });
  }

  render() {
    var x = this.square.startX + this.square.cellPX * this.indexX;
    var y = this.square.startY + this.square.cellPX * this.indexY;
    var backgroundColor = this.type == CellType.Block ? '#000000': '#DDDDDD';
    this.shape.graphics.beginFill(backgroundColor).drawRect(x, y, this.square.cellPX, this.square.cellPX);
  }
}

async function init() {
  var stage = new createjs.Stage("demoCanvas");
  createjs.Touch.enable(stage);

  var square = new Square(stage, 14, 14, 60, 2);
  square.cells[0][1].type = CellType.Block;
  square.render();
  // {
  //   var circle = new createjs.Shape();
  //   circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
  //   circle.x = 100;
  //   circle.y = 100;
  //   stage.addChild(circle);
  // }
  stage.update();
}