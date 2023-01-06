import { Direction } from "/src/blind-path-finding/types";

export function getOppositeDirection(direction: Direction): Direction {
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

export function getDirectionDiff(direction: Direction): [number, number] {
  const diff: [number, number] = [0, 0];
  switch (direction) {
    case Direction.UP: {
      diff[0]--;
      break;
    }
    case Direction.DOWN: {
      diff[0]++;
      break;
    }
    case Direction.LEFT: {
      diff[1]--;
      break;
    }
    case Direction.RIGHT: {
      diff[1]++;
      break;
    }
  }
  return diff;
}
