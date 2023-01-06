<script lang="ts">
  import clsx from "clsx";
  import {
    getDirectionDiff,
    getOppositeDirection,
  } from "/src/blind-path-finding/helpers";

  import Maze from "/src/blind-path-finding/maze";
  import Robot from "/src/blind-path-finding/robot";
  import { Cell, Direction } from "/src/blind-path-finding/types";
  import Button from "/src/components/button.svelte";
  import Map from "/src/components/map.svelte";

  const MAX_ROWS = 30;
  const MAX_COLS = 60;
  const MIN_ROWS = 5;
  const MIN_COLS = 5;

  let wait = 10;

  let mapRows = 30;
  let mapCols = 60;

  let robotRow = 1;
  let robotCol = 1;

  let robotExist = true;

  let paintType: Cell = Cell.WALL;

  let started = false;

  let currentDirection: Direction;

  let map: Cell[][];

  let steps: number = 0;

  $: resetMap(mapRows, mapCols);

  const resetMap = (createRows: number, createCols: number) => {
    const rows = createRows || MIN_ROWS;
    const cols = createCols || MIN_COLS;

    const tmp: Cell[][] = new Array(rows);

    tmp[0] = new Array(cols).fill(Cell.WALL);
    tmp[rows - 1] = new Array(cols).fill(Cell.WALL);

    for (let i = 1; i < rows - 1; i++) {
      tmp[i] = new Array(cols).fill(Cell.SPACE);

      tmp[i][0] = Cell.WALL;
      tmp[i][cols - 1] = Cell.WALL;
    }

    tmp[robotRow][robotCol] = Cell.ROBOT;

    map = tmp;
  };

  const paintMap = (row: number, col: number) => {
    if (
      row === 0 ||
      row === mapRows - 1 ||
      col === 0 ||
      col === mapCols - 1 ||
      started
    )
      return;

    let toPaint: Cell = Cell.WALL;
    let currentCell = map[row][col];

    if (currentCell === Cell.ROBOT) {
      robotExist = false;
    }

    if (paintType === Cell.ROBOT) {
      if (currentCell === Cell.ROBOT) {
        toPaint = Cell.SPACE;
      } else {
        if (robotExist) return;
        robotCol = col;
        robotRow = row;
        toPaint = Cell.ROBOT;
        robotExist = true;
      }
    } else if (paintType === Cell.GATE) {
      if (currentCell === Cell.GATE) {
        toPaint = Cell.SPACE;
      } else {
        toPaint = Cell.GATE;
      }
    } else if (paintType === Cell.WALL) {
      if (currentCell === Cell.WALL) {
        toPaint = Cell.SPACE;
      } else {
        toPaint = Cell.WALL;
      }
    }

    map[row][col] = toPaint;
  };

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const start = () => {
    if (started) {
      started = false;
      resetMap(mapRows, mapCols);
    } else {
      started = true;
      const maze = new Maze(map, robotRow, robotCol);
      new Robot(maze).navigate(async (direction: Direction, cell: Cell) => {
        if (currentDirection === getOppositeDirection(direction)) {
          map[robotRow][robotCol] = cell;
        }
        currentDirection = direction;
        const [row, col] = getDirectionDiff(direction);
        robotCol += col;
        robotRow += row;
        map[robotRow][robotCol] = cell;
        steps++;
        await delay(wait);
      });
    }
  };
</script>

<main class="min-h-screen flex gap-8 bg-neutral-100 justify-start items-center">
  <div class="gap-8 items-center mb-4 ml-16">
    <div class="">
      Steps: {steps}
      <div>
        <label for="rows">Rows (max: {MAX_ROWS})</label>
        <br />
        <input
          type="number"
          id="rows"
          max={MAX_ROWS}
          min={MIN_COLS}
          class="w-32 p-1.5 border-rose-500 border-2 rounded"
          bind:value={mapRows}
        />
      </div>
      <div>
        <label for="cols">Cols: (max: {MAX_COLS})</label>
        <br />
        <input
          type="number"
          id="cols"
          max={MAX_COLS}
          min={MIN_COLS}
          class="w-32 p-1.5 border-rose-500 border-2 rounded"
          bind:value={mapCols}
        />
      </div>
      <div>
        <label for="cols">Time</label>
        <br />
        <input
          type="number"
          id="cols"
          class="w-32 p-1.5 border-rose-500 border-2 rounded"
          bind:value={wait}
        />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <Button on:click={() => (paintType = Cell.WALL)}>Wall</Button>
      <Button on:click={() => (paintType = Cell.GATE)}>Gate</Button>
      <Button on:click={() => (paintType = Cell.ROBOT)}>Robot</Button>
    </div>
    <div class="flex gap-2">
      Active:
      <div
        class={clsx(
          {
            "bg-red-300": paintType === Cell.WALL,
            "bg-blue-300": paintType === Cell.GATE,
            "bg-green-400": paintType === Cell.ROBOT,
          },
          "border rounded-sm border-black w-6 h-6"
        )}
      />
    </div>

    <Button on:click={start}>{started ? "Reset" : "Start"}</Button>
  </div>

  <Map {map} {paintMap} />
</main>
