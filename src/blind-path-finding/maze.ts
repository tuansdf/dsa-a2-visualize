export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum Signal {
  TRUE = "true",
  FALSE = "false",
  WIN = "win",
}

export enum Cell {
  WALL = ".",
  SPACE = " ",
  GATE = "X",
  WIN = "W",
  PATH = "*",
  ROBOT = "R",
}

export default class Maze {
  private rows: number;
  private cols: number;
  private map: Cell[][];
  private _mapPublic: Cell[][];
  private robotRow: number;
  private robotCol: number;
  private _steps: number;

  constructor(map: Cell[][], robotRow: number, robotCol: number) {
    this.map = map;
    this._mapPublic = JSON.parse(JSON.stringify(this.map));
    this._mapPublic[robotRow][robotCol] = Cell.ROBOT;

    // robot position
    this.robotRow = robotRow;
    this.robotCol = robotCol;
    this._steps = 0;
  }

  get mapPublic() {
    return this._mapPublic;
  }
  get steps() {
    return this._steps;
  }

  public go(direction: Direction): Signal {
    let currentRow = this.robotRow;
    let currentCol = this.robotCol;

    if (direction === Direction.UP) {
      currentRow--;
    } else if (direction == Direction.DOWN) {
      currentRow++;
    } else if (direction === Direction.LEFT) {
      currentCol--;
    } else {
      currentCol++;
    }

    // check the next position
    if (this.map[currentRow][currentCol] === Cell.GATE) {
      // Exit gate
      this._steps++;
      this._mapPublic[currentRow][currentCol] = Cell.GATE;
      // for (const row of this.mapPublic) console.log(row);
      return Signal.WIN;
    } else if (this.map[currentRow][currentCol] === Cell.WALL) {
      // Wall
      this._steps++;
      this._mapPublic[currentRow][currentCol] = Cell.WALL;
      return Signal.FALSE;
    } else {
      // Space => update robot location
      this._steps++;
      this.robotRow = currentRow;
      this.robotCol = currentCol;
      this._mapPublic[currentRow][currentCol] = Cell.PATH;
      return Signal.TRUE;
    }
  }
}
