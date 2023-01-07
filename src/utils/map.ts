import { Cell } from "/src/blind-path-finding/types";

export function createMap(rows: number, cols: number): Cell[][] {
  const map: Cell[][] = new Array(rows);

  map[0] = new Array(cols).fill(Cell.WALL);
  map[rows - 1] = new Array(cols).fill(Cell.WALL);

  for (let i = 1; i < rows - 1; i++) {
    map[i] = new Array(cols).fill(Cell.SPACE);

    map[i][0] = Cell.WALL;
    map[i][cols - 1] = Cell.WALL;
  }

  return map;
}
