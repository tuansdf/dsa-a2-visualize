import Branch from "./branch";
import { getDirectionDiff, getOppositeDirection } from "./helpers";
import type Maze from "./maze";
import Stack from "./stack";
import { Cell, Direction, Signal } from "./types";

const VIRT_HALF = 100;
const VIRT_FULL = VIRT_HALF * 2;

interface GoOptions {
  // every time robot move
  afterEachMove?: (direction: Direction, cell: Cell) => Promise<void> | void;
  // move or hit the wall
  afterEachHit?: () => Promise<void> | void;
}

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

  public async navigate(goOptions?: GoOptions) {
    const branches: Stack<Branch> = new Stack<Branch>();

    // register all four directions into the wait-list
    branches.push(new Branch(Direction.LEFT));
    branches.push(new Branch(Direction.RIGHT));
    branches.push(new Branch(Direction.DOWN));
    branches.push(new Branch(Direction.UP));

    let currentBranch: Branch;
    let currentDirection: Direction;
    let currentSignal: Signal;

    while (currentSignal !== Signal.WIN) {
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
        const opposite = getOppositeDirection(currentDirection);
        this.adapterGo(opposite);

        await goOptions?.afterEachMove?.(opposite, Cell.CROSS);
        await goOptions?.afterEachHit?.();

        branches.pop();
        continue;
      }

      // check the next cell and consider own path as obstacle
      currentSignal = this.virtualCheck(currentDirection, false);
      // only when the virtual map does not have record of such obstacle,
      // advance to the next cell
      if (currentSignal === Signal.TRUE) {
        currentSignal = this.adapterGo(currentDirection);
        await goOptions?.afterEachHit?.();
      }

      // if there is an obstacle, remove that branch
      if (currentSignal === Signal.FALSE) {
        branches.pop();
      }
      // if there is no obstacle, end that branch
      else {
        await goOptions?.afterEachMove?.(currentDirection, Cell.PATH);

        currentBranch.end = true;
        this.forkBranch(branches, currentDirection);
      }
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
        this.virtualGo(getOppositeDirection(direction));
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

  // maze.go() but for virtual map only
  private virtualGo(direction: Direction): string {
    // this method cares about moving the robot, does not matter if it is overriding or not
    let result: string = this.virtualCheck(direction, true);
    if (result === Signal.TRUE) {
      const [row, col] = getDirectionDiff(direction);
      this.virtualCurrentCol += col;
      this.virtualCurrentRow += row;
    }
    return result;
  }

  // mirror of maze.go() for easy checking surrounding on virtual map
  // isOverride: if the robot can step on its own path or not
  private virtualCheck(direction: Direction, isOverride: boolean): Signal {
    let currentRow: number = this.virtualCurrentRow;
    let currentCol: number = this.virtualCurrentCol;

    const [row, col] = getDirectionDiff(direction);
    currentCol += col;
    currentRow += row;

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
