import { getDirectionDiff } from "./helpers";
import { Cell, Direction, Signal } from "./types";

export default class Maze {
  private map: Cell[][];
  private robotRow: number;
  private robotCol: number;
  private steps: number;

  constructor(map: Cell[][], robotRow: number, robotCol: number) {
    this.map = map;

    // robot position
    this.robotRow = robotRow;
    this.robotCol = robotCol;
    this.steps = 0;
  }

  public getSteps() {
    return this.steps;
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
      this.steps++;
      return Signal.WIN;
    } else if (this.map[currentRow][currentCol] === Cell.WALL) {
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
