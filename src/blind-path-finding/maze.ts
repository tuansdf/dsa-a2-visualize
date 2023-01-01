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
  private map: string[];
  private mapPublic: Cell[][];
  private robotRow: number;
  private robotCol: number;
  private steps: number;

  constructor() {
    this.rows = 1000;
    this.cols = 1000;
    this.map = new Array(5);

    this.map[0] = "...............";
    this.map[1] = ".        .    .";
    this.map[2] = ".        .    .";
    this.map[3] = ".             .";
    this.map[4] = "...............";

    // robot position
    this.robotRow = 1;
    this.robotCol = 3;
    this.steps = 0;
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
      this.steps++;
      return Signal.WIN;
    } else if (this.map[currentRow].charAt(currentCol) === Cell.WALL) {
      // Wall
      this.steps++;
      return Signal.FALSE;
    } else {
      // Space => update robot location
      this.steps++;
      this.robotRow = currentRow;
      this.robotCol = currentCol;
      return Signal.TRUE;
    }
  }
}
