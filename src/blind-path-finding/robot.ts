import Branch from "/src/blind-path-finding/branch";
import Maze, { Cell, Direction, Signal } from "/src/blind-path-finding/maze";
import Stack from "/src/blind-path-finding/stack";

const VIRT_HALF = 100;
const VIRT_FULL = VIRT_HALF * 2;

export default class Robot {
  private virtualMap: Cell[][];
  private virtualCurrentCol: number;
  private virtualCurrentRow: number;

  private maze: Maze;

  constructor(maze: Maze) {
    // initialize the virtual map for robot
    this.virtualMap = new Array(VIRT_FULL);
    for (let i = 0; i < VIRT_FULL; i++) {
      this.virtualMap[i] = new Array(VIRT_FULL).fill(Cell.SPACE);
    }

    // assume the robot is in the position (0, 0) in its virtual map,
    // so index 0 + the length of one half to put it at the center of the 2d array
    this.virtualCurrentCol = VIRT_HALF;
    this.virtualCurrentRow = VIRT_HALF;

    // mark the starting point
    this.replaceCellAt(
      this.virtualCurrentRow,
      this.virtualCurrentCol,
      Cell.PATH
    );

    this.maze = maze;
  }

  public navigate() {
    const startTime: number = performance.now();

    const branches: Stack<Branch> = new Stack<Branch>();

    // register all four directions into the wait-list
    branches.push(new Branch(Direction.LEFT));
    branches.push(new Branch(Direction.RIGHT));
    branches.push(new Branch(Direction.DOWN));
    branches.push(new Branch(Direction.UP));

    let currentBranch: Branch;
    let currentDirection: Direction;
    let currentResult: Signal;

    while (currentResult !== Signal.WIN) {
      // always get the direction from the top of the stack in every loop
      currentBranch = branches.peek();
      if (currentBranch == null) {
        break;
      }
      currentDirection = currentBranch.direction;

      // if the current branch already branched out earlier,
      // back-track to the previous branch and terminate the current branch
      if (currentBranch.end) {
        // back-track to the previous branch
        this.adapterGo(this.getOppositeDirection(currentDirection));
        branches.pop();
        continue;
      }

      // check the next cell and consider own path as obstacle
      currentResult = this.virtualCheck(currentDirection, false);
      // only when the virtual map does not have record of such obstacle,
      // advance to the next cell
      if (currentResult === Signal.TRUE) {
        currentResult = this.adapterGo(currentDirection);
      }

      // if there is an obstacle, remove that branch
      if (currentResult === Signal.FALSE) {
        branches.pop();
      }
      // if there is no obstacle, end that branch
      else {
        currentBranch.end = true;
        this.forkBranch(branches, currentDirection);
      }
    }

    // * --- *
    // stats for testing only
    const endTime: number = performance.now();
    const elapsedTime: number = endTime - startTime;

    console.log(`Elapsed time: ${elapsedTime} ms`);
    // mark the robot
    this.replaceCellAt(VIRT_HALF, VIRT_HALF, Cell.ROBOT);
    // mark the gate
    if (currentResult === Signal.WIN) {
      this.replaceCellAt(
        this.virtualCurrentRow,
        this.virtualCurrentCol,
        Cell.WIN
      );
    }
  }

  // add three new direction except the opposite to the current direction
  private forkBranch(branches: Stack<Branch>, direction: Direction): void {
    switch (direction) {
      case Direction.UP: {
        branches.push(new Branch(Direction.LEFT));
        branches.push(new Branch(Direction.RIGHT));
        branches.push(new Branch(Direction.UP));
        break;
      }
      case Direction.DOWN: {
        branches.push(new Branch(Direction.LEFT));
        branches.push(new Branch(Direction.RIGHT));
        branches.push(new Branch(Direction.DOWN));
        break;
      }
      case Direction.LEFT: {
        branches.push(new Branch(Direction.DOWN));
        branches.push(new Branch(Direction.UP));
        branches.push(new Branch(Direction.LEFT));
        break;
      }
      case Direction.RIGHT: {
        branches.push(new Branch(Direction.DOWN));
        branches.push(new Branch(Direction.UP));
        branches.push(new Branch(Direction.RIGHT));
        break;
      }
    }
  }

  private replaceCellAt(row: number, col: number, newChar: Cell) {
    this.virtualMap[row][col] = newChar;
  }

  // run both go at the same time
  private adapterGo(direction: Direction): Signal {
    let result: Signal = this.maze.go(direction);

    if (result === Signal.FALSE) {
      // those series of moves are just for marking the wall
      // prepare to mark wall in virtual map
      let virtualResult: string = this.virtualGo(direction);
      if (virtualResult === Signal.TRUE) {
        // mark wall
        this.replaceCellAt(
          this.virtualCurrentRow,
          this.virtualCurrentCol,
          Cell.WALL
        );
        // go back to the original place
        this.virtualGo(this.getOppositeDirection(direction));
      }
    } else {
      // move in virtual map and mark path
      this.virtualGo(direction);
      this.replaceCellAt(
        this.virtualCurrentRow,
        this.virtualCurrentCol,
        Cell.PATH
      );
    }

    return result;
  }

  private getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
    }
  }

  // maze.go() but for virtual map only
  private virtualGo(direction: Direction): string {
    // this method cares about moving the robot, does not matter if it is overriding or not
    let result: string = this.virtualCheck(direction, true);
    if (result === Signal.TRUE) {
      switch (direction) {
        case Direction.UP: {
          this.virtualCurrentRow--;
          break;
        }
        case Direction.DOWN: {
          this.virtualCurrentRow++;
          break;
        }
        case Direction.LEFT: {
          this.virtualCurrentCol--;
          break;
        }
        case Direction.RIGHT: {
          this.virtualCurrentCol++;
          break;
        }
      }
    }
    return result;
  }

  // mirror of maze.go() for easy checking surrounding on virtual map
  // isOverride: if the robot can step on its own path or not
  private virtualCheck(direction: Direction, isOverride: boolean): Signal {
    let currentRow: number = this.virtualCurrentRow;
    let currentCol: number = this.virtualCurrentCol;

    switch (direction) {
      case Direction.UP: {
        currentRow--;
        break;
      }
      case Direction.DOWN: {
        currentRow++;
        break;
      }
      case Direction.LEFT: {
        currentCol--;
        break;
      }
      case Direction.RIGHT: {
        currentCol++;
        break;
      }
    }

    switch (this.virtualMap[currentRow][currentCol]) {
      case Cell.WALL: {
        return Signal.FALSE;
      }
      case Cell.SPACE: {
        return Signal.TRUE;
      }
      default: {
        if (isOverride) return Signal.TRUE;
        return Signal.FALSE;
      }
    }
  }
}
