import { getDirectionDiff } from "./helpers";
import { Cell, Direction, Signal } from "./types";

export default class Maze {
  private map: Cell[][];
  private _mutMap: Cell[][];
  private robotRow: number;
  private robotCol: number;
  private _steps: number;

  constructor(map: Cell[][], robotRow: number, robotCol: number) {
    this.map = map;
    this._mutMap = map;

    // robot position
    this.robotRow = robotRow;
    this.robotCol = robotCol;
    this._steps = 0;
  }

  get steps() {
    return this._steps;
  }
  get mutMap() {
    return this._mutMap;
  }

  public go(direction: Direction): Signal {
    let currentRow = this.robotRow;
    let currentCol = this.robotCol;

    const [row, col] = getDirectionDiff(direction);
    currentCol += col;
    currentRow += row;

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

      if (this._mutMap[currentRow][currentCol] == Cell.PATH) {
        // mark current position as cross first
        this._mutMap[this.robotRow][this.robotCol] = Cell.CROSS;
        // then mark next
        this._mutMap[currentRow][currentCol] = Cell.CROSS;
      } else {
        this._mutMap[currentRow][currentCol] = Cell.PATH;
      }

      this.robotRow = currentRow;
      this.robotCol = currentCol;

      return Signal.TRUE;
    }
  }
}
