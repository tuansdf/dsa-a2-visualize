<script lang="ts">
  import {
    getDirectionDiff,
    getOppositeDirection,
  } from "/src/blind-path-finding/helpers";
  import Maze from "/src/blind-path-finding/maze";
  import Robot from "/src/blind-path-finding/robot";
  import { Cell, Direction, Signal } from "/src/blind-path-finding/types";

  import Button from "/src/components/button.svelte";
  import Map from "/src/components/map.svelte";
  import Select from "/src/components/select.svelte";
  import { delay } from "/src/utils/delay";

  const rowOptions = [10, 20, 30];
  const colOptions = [10, 20, 30, 40, 50];
  const timeOptions = [
    {
      label: "Very Fast",
      value: 1,
    },
    {
      label: "Fast",
      value: 10,
    },
    {
      label: "Slow",
      value: 20,
    },
    {
      label: "Very Slow",
      value: 40,
    },
  ];
  const paintOptions = [
    {
      label: "Wall",
      value: Cell.WALL,
    },
    {
      label: "Gate",
      value: Cell.GATE,
    },
    {
      label: "Robot",
      value: Cell.ROBOT,
    },
  ];

  let wait: number = timeOptions[timeOptions.length - 1].value;
  let mapRows: number = rowOptions[rowOptions.length - 1];
  let mapCols: number = colOptions[colOptions.length - 1];
  let paintType: Cell = Cell.WALL;

  let robotRow: number | undefined;
  let robotCol: number | undefined;

  let map: Cell[][];
  let currentDirection: Direction;
  let steps: number = 0;

  let started: boolean = false;
  let errorMessage: string | undefined;

  $: createMap(mapRows, mapCols);

  function isRobotExist() {
    return robotCol && robotRow;
  }
  function removeRobot() {
    robotCol = undefined;
    robotRow = undefined;
  }

  function createMap(createRows: number, createCols: number) {
    removeRobot();

    const rows = createRows;
    const cols = createCols;

    const tmp: Cell[][] = new Array(rows);

    tmp[0] = new Array(cols).fill(Cell.WALL);
    tmp[rows - 1] = new Array(cols).fill(Cell.WALL);

    for (let i = 1; i < rows - 1; i++) {
      tmp[i] = new Array(cols).fill(Cell.SPACE);

      tmp[i][0] = Cell.WALL;
      tmp[i][cols - 1] = Cell.WALL;
    }

    map = tmp;
  }

  function paintMap(row: number, col: number) {
    if (
      row === 0 ||
      row === mapRows - 1 ||
      col === 0 ||
      col === mapCols - 1 ||
      started
    ) {
      return;
    }

    let toPaint: Cell = Cell.WALL;
    let currentCell = map[row][col];

    if (currentCell === Cell.ROBOT) {
      removeRobot();
    }

    if (paintType === Cell.ROBOT) {
      if (currentCell === Cell.ROBOT) {
        toPaint = Cell.SPACE;
      } else {
        if (isRobotExist()) return;
        robotCol = col;
        robotRow = row;
        toPaint = Cell.ROBOT;
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
  }

  function start() {
    // reset if started
    if (started) {
      started = false;
      steps = 0;
      removeRobot();
      createMap(mapRows, mapCols);
      return;
    }

    // no robot on the map
    if (!isRobotExist()) {
      errorMessage = "Must have one robot";
      return;
    }

    errorMessage = undefined;
    started = true;
    const maze = new Maze(map, robotRow, robotCol);
    new Robot(maze).navigate({
      afterEachMove: async (
        direction: Direction,
        cell: Cell,
        signal: Signal
      ) => {
        if (signal === Signal.WIN) return;

        // when robot backtrack
        if (currentDirection === getOppositeDirection(direction)) {
          map[robotRow][robotCol] = cell;
        }

        currentDirection = direction;
        const [row, col] = getDirectionDiff(direction);
        robotCol += col;
        robotRow += row;
        if (map[robotRow][robotCol] !== Cell.ROBOT) {
          map[robotRow][robotCol] = cell;
        }

        await delay(wait);
      },
      afterEachHit: () => {
        steps++;
      },
    });
  }
</script>

<main class="min-h-screen flex gap-16 justify-start items-center">
  <!-- controll board -->
  <div class="flex-none space-y-6 ml-16 w-40">
    <div class="space-y-4">
      <div class="flex gap-4">
        <Select
          id="rows"
          label="Rows"
          bind:value={mapRows}
          options={rowOptions}
        />
        <Select
          id="cols"
          label="Cols"
          bind:value={mapCols}
          options={colOptions}
        />
      </div>
      <Select
        id="paint"
        label="Paint"
        bind:value={paintType}
        options={paintOptions}
      />
      <Select
        id="speed"
        label="Speed"
        bind:value={wait}
        options={timeOptions}
      />
    </div>

    <div>
      Steps: {steps}
    </div>
    <Button on:click={start}>{started ? "Reset" : "Start"}</Button>
    {#if started}
      <div class="text-red-500">
        Please refresh the page to reset in the middle of the run
      </div>
    {/if}
    {#if errorMessage}
      <div class="text-red-500">{errorMessage}</div>
    {/if}
  </div>

  <div class="flex-1 flex justify-center items-center">
    <Map {map} {paintMap} />
  </div>
</main>
