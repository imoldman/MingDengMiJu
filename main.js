// https://bbs.cnool.net/10766678.html

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var UIConfig = {
  WallColor: '#444444',
  LightColor: '#F5C400',
  FloorColor: '#DDDDDD',
  ErrorColor: '#FE0000',
  WallNumberColor: '#EEEEEE',
  WallNumberFont: '50px Arial',
  WallNumberOffsetXPX: 15,
  WallNumberOffsetYPX: 7,
  BulbBitmapOffsetXPX: 5,
  BulbBitmapOffsetYPX: 1,
  CellPX: 60,
  GridLineWidthPX: 2
}

class Cell {
  constructor(stage, square, indexX, indexY) {
    if (this.constructor == Cell) {
      throw new Error("Cell is an abstract class");
    }
    this.stage = stage;
    this.square = square;
    this.indexX = indexX;
    this.indexY = indexY;

    this.hasError = false; // 是否需要提示用户这里出现了错误

    this.shape = new createjs.Shape();
    this.stage.addChild(this.shape);
  }

  isWall() {
    return false;
  }

  isNumberWall() {
    return  false;
  }

  _getXPX() {
    return this.square.startX + UIConfig.CellPX * this.indexX;
  }

  _getYPX() {
    return this.square.startY + UIConfig.CellPX * this.indexY;
  }

  render() {
    var xPX = this._getXPX();
    var yPX = this._getYPX();
    this.shape.graphics.beginFill(this.getBackgroundColor());
    this.shape.graphics.drawRect(xPX, yPX, UIConfig.CellPX, UIConfig.CellPX);
    this.renderForeground(xPX, yPX);
  }

  getBackgroundColor() {
    if (this.hasError) {
      return UIConfig.ErrorColor;
    } else {
      debugger;
      return '#000000';
    }
  }

  renderForeground(xPX, yPX) {
    // empty
  }
}

class WallCell extends Cell {
  constructor(stage, square, indexX, indexY) {
    super(stage, square, indexX, indexY);
  }

  isWall() {
    return true;
  }

  getBackgroundColor() {
    if (this.hasError) {
      return UIConfig.ErrorColor;
    } else {
      return UIConfig.WallColor;
    }
  }

}

class NumberWallCell extends WallCell {
  constructor(stage, square, indexX, indexY, number) {
    super(stage, square, indexX, indexY);
    this.number = number;
    this.text = new createjs.Text(this.number.toString(), UIConfig.WallNumberFont, UIConfig.WallNumberColor);
    // this.text.textBaseline = "alphabetic";
    stage.addChild(this.text);
  }

  renderForeground(xPX, yPX) {
    this.text.x = xPX + UIConfig.WallNumberOffsetXPX;
    this.text.y = yPX + UIConfig.WallNumberOffsetYPX;
  }

  isNumberWall() {
    return true;
  }
}

class FloorCell extends Cell {
  constructor(stage, square, indexX, indexY) {
    super(stage, square, indexX, indexY);
    this.shape.addEventListener('click', this.clicked.bind(this));

    this.hasLight = false; // 是否被光照射到
    this.hasBulb = false;  // 是否有灯泡

    // 灯泡素材
    this.bulbBitmap = new createjs.Bitmap('res/bulb.png');
    this.bulbBitmap.image.onload = () => {
      stage.update();
    }
    this.bulbBitmap.x = this._getXPX() + UIConfig.BulbBitmapOffsetXPX;
    this.bulbBitmap.y = this._getYPX() + UIConfig.BulbBitmapOffsetYPX;
  }

  clicked(event) {
    this.hasBulb = !this.hasBulb;
    if (this.hasBulb) {
      this.stage.addChild(this.bulbBitmap);
    } else {
      this.stage.removeChild(this.bulbBitmap);
    }
    this.square.cellManager.refreshLight();
  }

  getBackgroundColor() {
    if (this.hasError) {
       return UIConfig.ErrorColor;
    } else if (this.hasLight) {
      return UIConfig.LightColor;
    } else {
      return UIConfig.FloorColor;
    }
  }

  renderForeground(xPX, yPX) {

  }
}

class CellData {
  // '-'|'0'|'1'|'2'|'3'| -> Wall，也就是障碍物，'-' 表示没有周围灯泡要求， 0-3 表示周围灯泡要求
  // ' '|'B'|'L' -> Floor，也就是地板, ' ' 表示没有被照到也没有灯泡，'B' 表示有灯泡, 'L' 表示被照到了
  constructor(wallFloorData) {
    this.data = wallFloorData;
  }

  isWall(x, y) {
    var d = this.data[x][y];
    return d=='-' || this.isNumberWall(x, y);
  }

  isNumberWall(x, y) {
    var d = this.data[x][y];
    return d=='0' || d=='1' || d=='2' || d=='3';
  }

  getNumberIfIsNumberWall(x, y) {
    if (!this.isNumberWall(x, y)) {
      return -1;
    }
    return parseInt(this.data[x][y]);
  }
}

class CellManager {
  constructor(stage, square, xCount, yCount, cellData) {
    this.stage = stage;
    this.square = square;
    this.xCount = xCount;
    this.yCount = yCount;
    this._initCells(xCount, yCount, cellData);
  }

  _initCells(xCount, yCount, cellData) {
    this.cells = [];
    for (let i = 0; i < yCount; i++) {
      var cellRow = [];
      for (let j = 0; j < xCount; j++) {
        if (cellData.isWall(i, j)) {
          if (cellData.isNumberWall(i, j)) {
            cellRow.push(new NumberWallCell(this.stage, this.square, j, i, cellData.getNumberIfIsNumberWall(i, j)))
          } else {
            cellRow.push(new WallCell(this.stage, this.square, j, i));
          }
        } else {
          cellRow.push(new FloorCell(this.stage, this.square, j, i));
        }
      }
      this.cells.push(cellRow);
    }
  }

  renderCells() {
    for (let i = 0; i < this.cells.length; i++) {
      var cellRow = this.cells[i];
      for (let j = 0; j < cellRow.length; j++) {
        cellRow[j].render();
      }
    }
  }
  
  refreshLight() {
    // 清除灯光和错误标记
    for (let i = 0; i < this.cells.length; i++) {
      var cellRow = this.cells[i];
      for (let j = 0; j < cellRow.length; j++) {
        cellRow[j].hasError = false;
        if (!cellRow[j].isWall()) {
          cellRow[j].hasLight = false;
        }
      }
    }
    // 填充灯光并检查是否有灯泡互相照射
    for (let i = 0; i < this.cells.length; i++) {
      var cellRow = this.cells[i];
      for (let j = 0; j < cellRow.length; j++) {
        if(cellRow[j].hasBulb) {
          cellRow[j].hasLight = true;
          // 横向填充
          for (let k = j-1; k >= 0; k--) {
            if (cellRow[k].isWall()) {
              break;
            } else if (cellRow[k].hasBulb) {
              cellRow[j].hasError = cellRow[k].hasError = true;
            } else {
              cellRow[k].hasLight = true;;
            }
          }
          for (let k = j+1; k < this.xCount; k++) {
            if (cellRow[k].isWall()) {
              break;
            } else if (cellRow[k].hasBulb) {
              cellRow[j].hasError = cellRow[k].hasError = true;
            } else {
              cellRow[k].hasLight = true;
            }
          }
          // 纵向填充
          for (let k = i-1; k >= 0; k--) {
            if (this.cells[k][j].isWall()) {
              break;
            } else if (this.cells[k][j].hasBulb) {
              this.cells[k][j].hasError = this.cells[i][j].hasError = true;
            } else {
              this.cells[k][j].hasLight = true;
            }
          }
          for (let k = i+1; k < this.yCount; k++) {
            if (this.cells[k][j].isWall()) {
              break;
            } else if (this.cells[k][j].hasBulb) {
              this.cells[k][j].hasError = this.cells[i][j].hasError = true;
            } else {
              this.cells[k][j].hasLight = true;
            }
          }
        }
      }
    }
    // 检查障碍块数字是否符合
    for (let i = 0; i < this.cells.length; i++) {
      var cellRow = this.cells[i];
      for (let j = 0; j < cellRow.length; j++) {
        var cell = cellRow[j];
        if (cell.isNumberWall()) {
          var amount = cell.number;
          if (i > 0 && this.cells[i-1][j].hasBulb) {
            amount--;
          }
          if (i < this.yCount-1 && this.cells[i+1][j].hasBulb) {
            amount--;
          }
          if (j > 0 && cellRow[j-1].hasBulb) {
            amount--;
          }
          if (j < this.xCount-1 && cellRow[j+1].hasBulb) {
            amount--;
          }
          if (amount < 0) {
            cell.hasError = true;
          }
        }
      }
    }
    this.square.render();
    this.stage.update();
  }
}

class Square {
  constructor(stage, xCount, yCount, initedCellData) {
    this.xCount = xCount;
    this.yCount = yCount;
    this.startX = 2;
    this.startY = 2;
    this.stage = stage;

    // 初始化 Cell 管理器
    this.cellManager = new CellManager(this.stage, this, xCount, yCount, initedCellData);

    // 网格要浮在最上面，因此最后才 add
    this.gridShape = new createjs.Shape();
    this.stage.addChild(this.gridShape);
  }

  render() {
    // Render Cell
    this.cellManager.renderCells();
    // Render Self: 划分割线
    this._renderGrid(this.gridShape.graphics);
  }

  _renderGrid(g) {
    g.beginStroke("#000000");
    g.setStrokeStyle(UIConfig.GridLineWidthPX);
    // 横线
    for (let i = 0; i <= this.yCount; i++) {
      g.moveTo(this.startX, this.startY + UIConfig.CellPX* i);
      g.lineTo(this.startX + this.xCount * UIConfig.CellPX, this.startY + UIConfig.CellPX * i);
    }
    // 竖线
    for (let i = 0; i <= this.xCount; i++) {
      g.moveTo(this.startX + UIConfig.CellPX * i, this.startY);
      g.lineTo(this.startX + UIConfig.CellPX * i, this.startY + this.yCount * UIConfig.CellPX);
    }
    g.endStroke();
  }
}

async function init() {
  var stage = new createjs.Stage("demoCanvas");
  createjs.Touch.enable(stage);

  var data = new CellData([
    [' ', ' ', ' ', ' ', ' ', '-', '1', ' ', '-', '-', ' ', ' ', '-', ' '],
    [' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', '2', ' ', '-', ' ', '-', ' '],
    [' ', '2', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', '-', ' ', ' ', ' '],
    [' ', '0', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '2', ' ', ' '],
    [' ', '0', ' ', ' ', ' ', ' ', ' ', '-', ' ', '2', ' ', ' ', '-', ' '],
    ['-', ' ', '-', '-', '-', ' ', '1', '-', ' ', ' ', ' ', '-', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', '0'],
    ['0', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', '2', ' ', ' ', ' ', '-', '-', ' ', '0', '-', '0', ' ', '1'],
    [' ', '2', ' ', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-', ' '],
    [' ', ' ', '-', ' ', ' ', ' ', '1', ' ', ' ', '2', ' ', ' ', '-', ' '],
    [' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', '-', ' '],
    [' ', '0', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', '0', ' ', ' ', ' '],
    [' ', '0', ' ', ' ', '1', '-', ' ', '2', '-', ' ', ' ', ' ', ' ', ' ']
  ]);
  var square = new Square(stage, 14, 14, data);
  window.square = square;
  square.render();

  {
    // var img = new createjs.Bitmap('res/bulb.png');
    // img.image.onload = () => {
    //   stage.update();
    // }
    // stage.addChild(img);
    // img.x = 100;
    // img.y = 100;
  }

  stage.update();
}