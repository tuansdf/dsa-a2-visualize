import { Cell, Direction, Signal } from "/src/blind-path-finding/types";

export default class Maze {
  private rows: number;
  private cols: number;
  private map: Cell[][];
  private robotRow: number;
  private robotCol: number;
  private _steps: number;

  constructor(map: Cell[][], robotRow: number, robotCol: number) {
    this.map = map;

    // robot position
    this.robotRow = robotRow;
    this.robotCol = robotCol;
    this._steps = 0;
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
      return Signal.WIN;
    } else if (this.map[currentRow][currentCol] === Cell.WALL) {
      // Wall
      this._steps++;
      return Signal.FALSE;
    } else {
      // Space => update robot location
      this._steps++;
      this.robotRow = currentRow;
      this.robotCol = currentCol;
      return Signal.TRUE;
    }
  }
}
